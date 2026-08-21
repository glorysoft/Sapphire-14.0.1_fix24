using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Orders;
using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Orders
{
    // by OrderItemPriceAdjuster
    public class OrderItemPriceAdjusterByCart : IOrderItemPriceAdjuster
    {
        protected readonly ShoppingCart _cart;
        private readonly float _paymentFeeOrDiscount;
        private readonly float _usedBonuses;
        protected float? _acceptableDifference;
        protected float? _roundNumbers;
        protected bool _setRoundNumbers;
        protected bool? _noChangeAmount;
        protected bool? _noSeparate;
        protected Currency _currency;
        private bool _ceilingAmountToInteger;
 
        public OrderItemPriceAdjusterByCart(ShoppingCart cart, float paymentFeeOrDiscount, float usedBonuses)
        {
            _cart = cart;
            _paymentFeeOrDiscount = paymentFeeOrDiscount;
            _usedBonuses = usedBonuses;
        }
  
        public IOrderItemPriceAdjuster AcceptableDifference(float acceptableDifference)
        {
            _acceptableDifference = acceptableDifference;
            return this;
        }

        public IOrderItemPriceAdjuster RoundNumbers(float? roundNumbers)
        {
            _roundNumbers = roundNumbers;
            _setRoundNumbers = true;
            return this;
        }

        public IOrderItemPriceAdjuster NoChangeAmount()
        {
            _noChangeAmount = true;
            return this;
        }

        public IOrderItemPriceAdjuster NoSeparate()
        {
            _noSeparate = true;
            return this;
        }

        public IOrderItemPriceAdjuster WithCurrency(Currency currency)
        {
            _currency = currency;
            return this;
        }

        public IOrderItemPriceAdjuster CeilingAmountToInteger()
        {
            _ceilingAmountToInteger = true;
            return this;
        }

        public IList<OrderItem> GetItems() => GetItems(out _);
 
        public IList<OrderItem> GetItems(out float difference)
        {
            // Т.к. в ShoppingCartItem нет возможности переназначать конечную цену позиции
            // делаем через OrderItem
            List<OrderItem> sourceItems = _cart.Select(item =>
            {
                var orderItem = (OrderItem) item;
                orderItem.OrderItemID = item.ShoppingCartItemId; // связка OrderItemID с ShoppingCartItem
                return orderItem;
            }).ToList();
            IList<OrderItem> items = sourceItems
                                    .Select(item => item.DeepClone())
                                    .ToList();
            var changedIds = new Dictionary<int, int>();
            
            if (_ceilingAmountToInteger)
                items = items.CeilingAmountToInteger() as IList<OrderItem>;

            if (_currency != null)
                items = items.ConvertCurrency(CurrencyService.CurrentCurrency, _currency) as IList<OrderItem>;
   
            var newCurrency = _currency ?? CurrencyService.CurrentCurrency;

            items = ApplyDiscountToItems(
                items,
                item => item.IgnoreOrderDiscount is false,
                GetOrderDiscountPrice(sourceItems).ConvertCurrency(CurrencyService.CurrentCurrency, newCurrency));
            SetUniqueId(items, changedIds);// позиция может быть разбита на несколько, а ид нужен уникальный

            items = ApplyDiscountToItems(
                items,
                item => item.IsCouponApplied,
                GetOrderCouponPrice(sourceItems).ConvertCurrency(CurrencyService.CurrentCurrency, newCurrency));
            SetUniqueId(items, changedIds);// позиция может быть разбита на несколько, а ид нужен уникальный

            if (_usedBonuses > 0f)
            {
                var shippingDiscountByBonus = _usedBonuses - sourceItems.Where(item => item.DoNotApplyOtherDiscounts is false).Sum(item => item.Price * item.Amount);
                var orderBonusCost = _usedBonuses - (shippingDiscountByBonus > 0f ? shippingDiscountByBonus : 0f);
                items = ApplyDiscountToItems(
                    items,
                    item => item.DoNotApplyOtherDiscounts is false,
                    orderBonusCost.ConvertCurrency(CurrencyService.CurrentCurrency, newCurrency));
                SetUniqueId(items, changedIds);// позиция может быть разбита на несколько, а ид нужен уникальный
            }

            var recalculate = CreateRecalculate(items);
            var sum = Math.Max(_cart.TotalPrice - _cart.TotalDiscount, 0f).ConvertCurrency(CurrencyService.CurrentCurrency, newCurrency);
            var paymentFeeOrDiscount = _paymentFeeOrDiscount.ConvertCurrency(CurrencyService.CurrentCurrency, newCurrency);
            items = recalculate.ToSum(sum + paymentFeeOrDiscount, out difference);

            ResetIdToPristine(items, changedIds);
            
            return items;
        }

        private float GetOrderDiscountPrice(IList<OrderItem> items)
        {
            var orderDiscount = _cart.DiscountPercentOnTotalPrice; // by MyCheckout.CreateOrder
            var totalDiscount = orderDiscount > 0
                ? orderDiscount * items.Where(x => !x.IgnoreOrderDiscount).Sum(x => x.Price*x.Amount)/100
                : 0;

            return totalDiscount.SimpleRoundPrice(CurrencyService.CurrentCurrency);
        }

        private float GetOrderCouponPrice(IList<OrderItem> items)
        {
            if (_cart.Coupon == null || !_cart.CouponCanBeApplied)
                return 0;
            
            var couponPrice = 0f;
            
            switch (_cart.Coupon.Type)
            {
                case CouponType.Fixed:
                    var productsPrice = items.Where(x => x.IsCouponApplied).Sum(x => x.Price * x.Amount);
                    couponPrice = productsPrice >= _cart.Coupon.Value ? _cart.Coupon.Value : productsPrice;
                    break;
                case CouponType.Percent:
                    couponPrice = items.Where(x => x.IsCouponApplied).Sum(x => _cart.Coupon.Value*x.Price/100*x.Amount);
                    break;
            }

            return couponPrice.SimpleRoundPrice(CurrencyService.CurrentCurrency);
        }

        private IList<OrderItem> ApplyDiscountToItems(
            IList<OrderItem> orderItems,
            Func<OrderItem, bool> predicateDiscount,
            float discount)
        {
            var itemsForDiscount = orderItems.Where(predicateDiscount).ToList();

            if (itemsForDiscount.Count != 0
                && discount != 0f)
            {
                var recalculate = CreateRecalculate(itemsForDiscount);

                var recalculateItems = recalculate.ToSum(Math.Max(itemsForDiscount.Sum(x => x.Amount * x.Price) - discount, 0f).SimpleRoundPrice(CurrencyService.CurrentCurrency));

                foreach (var orderItem in orderItems.Where(x => predicateDiscount(x) is false))
                    recalculateItems.Add(orderItem);

                return recalculateItems;
            }

            return orderItems;
        }

        private void SetUniqueId(IList<OrderItem> items, IDictionary<int, int> changedIds)
        {
            /*
             * Позиция может быть разбита на несколько, а ид нужен уникальный.
             * Потому-что RecalculateOrderItemsToSum ожидает во входных данных позиции с уникальными Id
             */
            
            var ids = new HashSet<int>();
            foreach (var orderItem in items)
            {
                if (ids.Contains(orderItem.OrderItemID))
                {
                    var newId = Guid.NewGuid().GetHashCode();
                    changedIds.Add(newId, orderItem.OrderItemID);
                    orderItem.OrderItemID = newId;
                }
                ids.Add(orderItem.OrderItemID);
            }
        }

        private void ResetIdToPristine(IList<OrderItem> items, IDictionary<int, int> changedIds)
        {
            foreach (var orderItem in items)
                if (changedIds.TryGetValue(orderItem.OrderItemID, out var pristineId))
                    orderItem.OrderItemID = pristineId;
        }

        private RecalculateOrderItemsToSum CreateRecalculate(IEnumerable<OrderItem> items)
        {
            var recalculate = new RecalculateOrderItemsToSum(items);
            if (_acceptableDifference.HasValue)
                recalculate.AcceptableDifference = _acceptableDifference.Value;
            if (_noChangeAmount.HasValue)
                recalculate.NoChangeAmount = _noChangeAmount.Value;
            if (_noSeparate.HasValue)
                recalculate.NotSeparate = _noSeparate.Value;
            if (_setRoundNumbers)
                recalculate.RoundNumbers = _roundNumbers;
            return recalculate;
        }
    }
}