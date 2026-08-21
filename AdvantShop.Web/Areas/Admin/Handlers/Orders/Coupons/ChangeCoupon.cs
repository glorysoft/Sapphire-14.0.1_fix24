using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Customers;
using AdvantShop.Orders;
using AdvantShop.Repository.Currencies;
using AdvantShop.Shipping;
using AdvantShop.Taxes;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Orders.Coupons
{
    public class ChangeCoupon : AbstractCommandHandler
    {
        private readonly int _orderId;
        private readonly string _couponCode;

        private Order _order;
        private Coupon _coupon;

        public ChangeCoupon(int orderId, string couponCode)
        {
            _orderId = orderId;
            _couponCode = couponCode;
        }

        protected override void Validate()
        {
            if (string.IsNullOrWhiteSpace(_couponCode))
                throw new BlException("Укажите код купона");

            _coupon = CouponService.GetCouponByCode(_couponCode);
            
            if (_coupon == null)
                throw new BlException("Купон не найден");

            _order = OrderService.GetOrder(_orderId);
            if (_order == null)
                throw new BlException("Заказ не найден");
            
            if (_order.Coupon != null)
                throw new BlException($"К заказу уже применен купон {_order.Coupon.Code}");

            if (_coupon.OnlyInMobileApp 
                && _order.OrderSource != null 
                && _order.OrderSource.Type != OrderType.MobileApp)
            {
                throw new BlException($"Купон может быть применен только в мобильном приложении. Источник заказа не мобильное приложение.");
            }
            
            if ( _coupon.ForFirstOrderInMobileApp)
            {
                if (_order.OrderSource != null && _order.OrderSource.Type != OrderType.MobileApp)
                    throw new BlException($"Купон может быть применен только в мобильном приложении. Источник заказа не мобильное приложение.");
                
                if (_order.OrderCustomer == null)
                    throw new BlException("Купон не может быть применен из-за отсутствия покупателя.");
                
                if (OrderService.IsCustomerHasConfirmedOrdersFromMobileApp(_order.OrderCustomer.CustomerID))
                    throw new BlException(T("Coupon.CouponPost.CouponOnlyForFirstOrderInMobileApp"));
            }

            if (_coupon.OnlyOnCustomerBirthday)
            {
                var error = CouponService.CheckCustomerCouponByBirthday(_coupon, CustomerService.GetCustomer(_order.OrderCustomer.CustomerID));
                if (error.IsNotEmpty())
                    throw new BlException(error);
            }

            if (_coupon.ShippingMethodIds != null
                && _coupon.ShippingMethodIds.Count > 0
                && !_coupon.ShippingMethodIds.Contains(_order.ShippingMethodId))
            {
                var shippings = ShippingMethodService.GetAllShippingMethods()
                    .Where(x => _coupon.ShippingMethodIds.Contains(x.ShippingMethodId))
                    .Select(x => x.Name);

                throw new BlException(
                    $"Купон может быть применен только для доставки {string.Join(", ", shippings.Select(x => "\"" + x + "\""))}");
            }
        }

        protected override void Handle()
        {
            _order.Coupon = new OrderCoupon(_coupon);

            var withRecalculatePrice = _coupon.Type != CouponType.FixedOnGiftOffer;
            
            foreach (var item in _order.OrderItems)
            {
                if (!item.ProductID.HasValue || item.IsGift)
                    continue;

                OrderItemPriceService.CalculateFinalPrice(item, _order, out float price, out Discount discount, out OfferPriceRule priceRule);
                    
                var offer = OfferService.GetOffer(item.ArtNo);

                if (_coupon.IsAppliedToProduct(
                        item.ProductID.Value, 
                        offer?.OfferId, 
                        price, 
                        discount,
                        item.DoNotApplyOtherDiscounts, 
                        priceRule))
                {
                    item.IsCouponApplied = true;

                    if (withRecalculatePrice)
                    {
                        if (item.IsCustomPrice)
                        {
                            item.BasePrice = item.Price;
                            item.DiscountAmount = 0;
                            item.DiscountPercent = 0;
                        }

                        if (!_coupon.IsAppliedToPriceWithDiscount)
                            item.Price = price;
                    }
                }
            }
            
            var isCouponAppliedToOrder = _coupon.IsAppliedToOrder(_order);
            if (!isCouponAppliedToOrder.IsSuccess)
                throw new BlException(isCouponAppliedToOrder.Error.Message);

            if (_coupon.Type == CouponType.FixedOnGiftOffer)
            {
                if (_coupon.GiftOfferId == null)
                    throw new BlException("Купон не может быть применен из-за отсутствия подарочного товара");

                var offer = OfferService.GetOffer(_coupon.GiftOfferId.Value);
                var orderItem = (OrderItem)offer;

                orderItem.Price = _coupon.GetRate();
                orderItem.IsByCoupon = true;
                orderItem.IsCustomPrice = true;
                
                _order.OrderItems.Add(orderItem);
            }

            OrderService.AddOrderCoupon(_order.OrderID, _order.Coupon);

            var oldOrderItems = OrderService.GetOrderItems(_order.OrderID);
            OrderService.AddUpdateOrderItems(_order.OrderItems, oldOrderItems, _order, trackChanges: !_order.IsDraft);

            if (_coupon.Type == CouponType.FreeShipping)
            {
                _order.ShippingCost = 0;
            }

            if (_order.OrderStatus != null && !_order.OrderStatus.IsCanceled)
            {
                CouponService.IncrementActualUses(_coupon.CouponID);
            }
            
            if (new SetPriceRuleBySum(_order).CanSetPriceRuleBySum())
                new UpdateOrderItems(_order).Execute();

            new UpdateOrderTotal(_order).Execute();
        }
    }
}