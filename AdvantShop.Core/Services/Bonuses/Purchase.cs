using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Orders;
using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Bonuses
{
    public class Purchase : IPurchase
    {
        public string Number { get; set; }
        public float ShippingCost { get; set; }
        public float? UsedBonuses { get; set; }
        public string CouponCode { get; set; }
        public Currency Currency { get; set; }
        public string Comment { get; set; }
        IReadOnlyList<IItem> IPurchase.Items => Items;
        public List<ItemOfPurchase> Items { get; set; }

        public static Purchase CreateBy(Order order)
        {
            var purchase = new Purchase
            {
                Number = order.Number,
                ShippingCost = order.ShippingCost,
                UsedBonuses = order.BonusCost,
                CouponCode = order.Coupon?.Code,
                Currency = order.OrderCurrency,
                Comment = $"Заказ {order.Number}"
            };
            float pristineBonusCost = order.BonusCost;
            float pristineSum = order.Sum;
            // Рассчитываем цены без скидки за бонусы
            order.BonusCost = 0;
            order.Sum += pristineBonusCost;
            
            var orderItemPriceAdjuster = order.GetOrderItemsWithDiscountsAndFee()
                                              .AcceptableDifference(0f)
                                              .NoChangeAmount();

            var items = orderItemPriceAdjuster.GetItems(out var difference);
            if (difference > 0.01f)
            {
                // повторяем без NoChangeAmount
                orderItemPriceAdjuster = order.GetOrderItemsWithDiscountsAndFee()
                                              .AcceptableDifference(0f);
                items = orderItemPriceAdjuster.GetItems();
            }
            
            purchase.Items = 
                items
                   .Select(x => new ItemOfPurchase
                    {
                        Code = x.ArtNo,
                        Price = x.Price,
                        BasePrice = x.BasePrice ?? x.Price,
                        Amount = x.Amount,
                        ApplyDiscounts = !x.DoNotApplyOtherDiscounts,
                        AccrueBonuses = x.AccrueBonuses,
                    })
                   .ToList();
            
            order.BonusCost = pristineBonusCost;
            order.Sum = pristineSum;

            return purchase;
        }

        public static Purchase CreateBy(ShoppingCart shoppingCart, float shippingCost, float paymentFeeOrDiscount, float? usedBonuses)
        {
            var purchase = new Purchase
            {
                ShippingCost = shippingCost,
                UsedBonuses = usedBonuses,
                CouponCode = shoppingCart.Coupon?.Code,
                Currency = CurrencyService.CurrentCurrency,
            };
                  
            var orderItemPriceAdjuster = shoppingCart.GetOrderItemsWithDiscountsAndFee(paymentFeeOrDiscount)// Рассчитываем цены без скидки за бонусы
                                                     .AcceptableDifference(0f)
                                                     .NoChangeAmount();

            var items = orderItemPriceAdjuster.GetItems(out var difference);
            if (difference > 0.01f)
            {
                // повторяем без NoChangeAmount
                orderItemPriceAdjuster = shoppingCart.GetOrderItemsWithDiscountsAndFee(paymentFeeOrDiscount)// Рассчитываем цены без скидки за бонусы
                                                     .AcceptableDifference(0f);
                items = orderItemPriceAdjuster.GetItems();
            }
            
            purchase.Items = 
                items
                   .Select(x => new ItemOfPurchase
                    {
                        Code = x.ArtNo,
                        Price = x.Price,
                        BasePrice = x.BasePrice ?? x.Price,
                        Amount = x.Amount,
                        ApplyDiscounts = !x.DoNotApplyOtherDiscounts,
                        AccrueBonuses = x.AccrueBonuses,
                    })
                   .ToList();
            
            return purchase;
   
        }
    }
}