using AdvantShop.Orders;

namespace AdvantShop.Core.Services.Orders
{
    public static class ShoppingCartExtensions
    {
        public static IOrderItemPriceAdjuster GetOrderItemsWithDiscountsAndFee(this ShoppingCart cart, 
            float paymentFeeOrDiscount = 0, float usedBonuses = 0)
        {
            return new OrderItemPriceAdjusterByCart(cart, paymentFeeOrDiscount, usedBonuses);
        }
    }
}