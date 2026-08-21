//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Shop;
using AdvantShop.Customers;
using AdvantShop.Repository.Currencies;

namespace AdvantShop.Orders
{
    public class ShoppingCart : List<ShoppingCartItem>
    {
        public ShoppingCart() { }

        public ShoppingCart(List<ShoppingCartItem> cartItems)
        {
            this.AddRange(cartItems);
        }

        public ShoppingCart(Customer customer, List<ShoppingCartItem> cartItems) : this(cartItems)
        {
            _customer = customer;
        }

        private Customer _customer;
        public Customer Customer => _customer ?? (_customer = CustomerContext.CurrentCustomer);

        private float _totalPrice = float.MinValue;
        public float TotalPrice
        {
            get
            {
                return _totalPrice != float.MinValue
                    ? _totalPrice
                    : (_totalPrice = this.Sum(x => PriceService.SimpleRoundPrice(x.PriceWithDiscount * x.Amount)));
            }
        }

        /// <summary>
        /// сумма товаров, скидка на которые задается модулем
        /// </summary>
        private float? _totalPriceIgnoreDiscount;
        public float TotalPriceIgnoreDiscount
        {
            get
            {
                return
                    _totalPriceIgnoreDiscount
                    ?? (_totalPriceIgnoreDiscount =
                        this.Where(x =>
                                (x.ModuleKey.IsNotEmpty() && x.Discount.HasValue) ||
                                x.Offer.Product.DoNotApplyOtherDiscounts)
                            .Sum(x => x.PriceWithDiscount * x.Amount)
                        ).Value;
            }
        }

        public float TotalShippingWeight
        {
            get { return this.Sum(x => x.Offer.GetWeight() * x.Amount); }
        }

        /// <summary>
        /// количество товаров, скидка на которые задается модулем
        /// </summary>
        public float TotalItems => this.Sum(x => x.Amount);

        public float TotalItemsIgnoreDiscount
        {
            get { return this.Where(x => x.ModuleKey.IsNotEmpty() && x.Discount.HasValue).ToList().Sum(x => x.Amount); }
        }

        public bool HasItems => this.Count > 0;

        public bool CanOrder
        {
            get
            {
                if (!ShopService.AllowCheckoutNow())
                    return false;

                var minimumOrderPrice = CustomerGroupService.GetMinimumOrderPrice(this);
                
                if (TotalPrice < minimumOrderPrice || !HasItems)
                    return false;

                return this.All(item =>
                    item.CustomPrice != null && !item.IsByCoupon
                    || ShoppingCartService.GetAvailableState(item, this).IsNullOrEmpty());
            }
        }

        private int _customerGroupId;

        public int CustomerGroupId
        {
            get
            {
                if (_customerGroupId == 0)
                    _customerGroupId = Customer?.CustomerGroupId ?? CustomerGroupService.DefaultCustomerGroup;

                return _customerGroupId;
            }
        }

        public float DiscountPercentOnTotalPrice
        {
            get
            {
                if (Coupon == null && CustomerGroupId == CustomerGroupService.DefaultCustomerGroup)
                {
                    var discountModule = AttachedModules.GetModules<IShoppingCartDiscount>().FirstOrDefault();
                    if (discountModule != null)
                        return ((IShoppingCartDiscount)Activator.CreateInstance(discountModule)).GetDiscount(this);
                    return OrderService.GetDiscount(TotalPrice - TotalPriceIgnoreDiscount);
                }

                return 0;
            }
        }

        public float TotalDiscount
        {
            get
            {
                float discount = 0;
                discount += Certificate?.Sum ?? 0;

                //if (CustomerGroupId != CustomerGroupService.DefaultCustomerGroup)
                //    return discount;

                float discountPercentOnTotalPrice = DiscountPercentOnTotalPrice;
                discount += discountPercentOnTotalPrice > 0 ? discountPercentOnTotalPrice * (TotalPrice - TotalPriceIgnoreDiscount) / 100 : 0;

                if (Coupon != null && CouponCanBeApplied)
                {
                    switch (Coupon.Type)
                    {
                        case CouponType.Fixed:
                            var productsPrice = this.Where(x => x.IsCouponApplied).Sum(x => x.PriceWithDiscount * x.Amount);
                            var couponPrice = Coupon.GetRate();
                            discount += productsPrice >= couponPrice ? couponPrice : productsPrice;
                            break;
                        case CouponType.Percent:
                            discount += this.Where(x => x.IsCouponApplied).Sum(x => Coupon.Value * x.PriceWithDiscount / 100 * x.Amount);
                            break;
                    }
                }
                return discount.RoundPrice(CurrencyService.CurrentCurrency.Rate);
            }
        }

        private GiftCertificate _certificate;
        private bool _certificateLoaded;

        public GiftCertificate Certificate
        {
            get
            {
                if (_certificateLoaded)
                    return _certificate;

                if (_certificate == null)
                    _certificate = GiftCertificateService.GetCustomerCertificate(Customer.Id);

                if (_certificate != null && _coupon != null)
                    throw new Exception("Coupon and Certificate can't be used together");

                if (_certificate != null && (!_certificate.Paid || _certificate.Used || !_certificate.Enable))
                {
                    GiftCertificateService.DeleteCustomerCertificate(_certificate.CertificateId, Customer.Id);
                }

                _certificateLoaded = true;

                return _certificate;
            }
        }

        private Coupon _coupon;
        private bool _couponLoaded;

        public Coupon Coupon
        {
            get
            {
                if (_couponLoaded)
                    return _coupon;

                if (_coupon == null)
                    _coupon = CouponService.GetCustomerCoupon(Customer.Id);

                if (_coupon != null && _certificate != null)
                    throw new Exception("Coupon and Certificate can't be used together");

                _couponLoaded = true;

                return _coupon;
            }
            set
            {
                _coupon = value;
                _couponLoaded = true;
            }
        }

        public bool CouponCanBeApplied => Coupon.IsAppliedToCard(this);

        public override int GetHashCode()
        {
            return this.Aggregate(0, (curr, val) => val.GetHashCode() ^ curr) + 
                   (Certificate != null ? Certificate.GetHashCode() : 0) + (Coupon != null ? Coupon.GetHashCode() : 0);
        }

        public void ResetTotalPrice()
        {
            _totalPrice = float.MinValue;
            _totalPriceIgnoreDiscount = null;
        }
    }
}