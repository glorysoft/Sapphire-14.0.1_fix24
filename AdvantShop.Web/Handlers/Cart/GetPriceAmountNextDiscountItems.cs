using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Customers;
using AdvantShop.Models.Cart;
using AdvantShop.Orders;
using AdvantShop.Web.Infrastructure.Extensions;

namespace AdvantShop.Handlers.Cart
{
    public class GetPriceAmountNextDiscountItems
    {
        private readonly UrlHelper _urlHelper = new UrlHelper(HttpContext.Current.Request.RequestContext);

        public List<PriceAmountNextDiscountItem> Execute()
        {
            var customer = CustomerContext.CurrentCustomer;

            var result = new List<PriceAmountNextDiscountItem>();

            var showByAmount = SettingsPriceRules.ShowPriceAmountNextDiscountsInCart;
            var showByCartSum = SettingsPriceRules.ShowNextDiscountsByCartSumInCart;

            if (!showByAmount && !showByCartSum)
                return result;
            
            var cartSum = showByCartSum ? ShoppingCartService.CurrentShoppingCart.TotalPrice : 0;
            
            foreach (var cartItem in ShoppingCartService.CurrentShoppingCart)
            {
                if (cartItem.IsGift || cartItem.FrozenAmount)
                    continue;

                var ruleByAmount =
                    showByAmount
                        ? PriceRuleService.GetNextPriceRule(cartItem.OfferId, cartItem.Amount, customer.CustomerGroupId)
                        : null;
                
                if (ruleByAmount != null)
                    result.Add(GetNextDiscount(ruleByAmount, cartItem, customer));

                var sum =
                    cartItem.Offer.PriceRule != null
                    && cartItem.Offer.PriceRule.Mode == PriceRuleMode.ByCartSum
                        ? cartItem.Offer.PriceRule.CartSum
                        : cartSum;
                
                var ruleByCartSum =
                    showByCartSum
                        ? PriceRuleService.GetNextPriceRuleByCartSum(cartItem.OfferId, sum)
                        : null;
                
                if (ruleByCartSum != null)
                    result.Add(GetNextDiscount(ruleByCartSum, cartItem, customer));
            }

            return result;
        }
        private PriceAmountNextDiscountItem GetNextDiscount(OfferPriceRule rule, ShoppingCartItem cartItem, Customer customer)
        {
            var product = cartItem.Offer.Product;
            var offer = OfferService.GetOffer(cartItem.OfferId);

            var (oldPrice, finalPrice, finalDiscount, preparedPrice) =
                offer.GetOfferPricesWithPriceRule(rule, cartItem.AttributesXml, customer, null);

            return new PriceAmountNextDiscountItem()
            {
                Url = _urlHelper.AbsoluteRouteUrl("Product", new { url = product.UrlPath }) +
                      offer.GetOfferQueryString(),
                Name = product.Name,
                ColorName = offer.Color?.ColorName,
                SizeName = offer.Size?.SizeName,
                Price = finalPrice.FormatPrice(),
                Discount = finalDiscount.HasValue
                    ? finalDiscount.Type == DiscountType.Amount
                        ? finalDiscount.Amount.FormatPrice()
                        : finalDiscount.Percent + "%"
                    : null,
                Amount = rule.Amount,
                CartSum = rule.CartSum.FormatPrice(),
                Mode = rule.Mode.ToString().ToLower()
            };
        }
    }
}