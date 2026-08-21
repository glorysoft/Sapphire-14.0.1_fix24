using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Orders;

namespace AdvantShop.Web.Admin.Handlers.Orders
{
    /// <summary>
    /// Применить типы цен от суммы корзины. Работает только для черновика.
    /// </summary>
    public sealed class SetPriceRuleBySum
    {
        private readonly Order _order;

        public SetPriceRuleBySum(Order order)
        {
            _order = order;
        }

        public void Execute()
        {
            if (!CanSetPriceRuleBySum())
                return;

            ApplyPriceRuleBySum();
        }

        public bool CanSetPriceRuleBySum()
        {
            return false;
            
            if (!_order.IsDraft)
                return false;
            
            if (_order.OrderItems.Count == 0)
                return false;
            
            if (!PriceRuleService.IsActive())
                return false;
            
            if (!PriceRuleService.IsPriceRulesExists(PriceRuleMode.ByCartSum))
                return false;
            
            return true;
        }
        
        private void ApplyPriceRuleBySum()
        {
            var sum =
                _order.OrderItems.Sum(x => PriceService.SimpleRoundPrice(x.Price * x.Amount, _order.OrderCurrency))
                - _order.TotalDiscount;
            
            if (sum <= 0)
                return;
            
            var customerGroup = _order.GetCustomerGroup();
            var priorityByQuantity = SettingsPriceRules.PriceRulePriority == PriceRuleMode.ByQuantity;

            foreach (var orderItem in _order.OrderItems)
            {
                if (orderItem.IsCustomPrice || orderItem.IsGift || orderItem.IsByCoupon || orderItem.ProductID == null)
                    continue;
                
                var offer = OfferService.GetOffer(orderItem.ArtNo);
                if (offer == null || offer.ProductId != orderItem.ProductID)
                    continue;
                
                if (priorityByQuantity)
                {
                    var priceRuleByAmount = PriceRuleService.GetPriceRule(
                        offer.OfferId, 
                        orderItem.Amount, 
                        customerGroup.CustomerGroupId, 
                        _order.PaymentMethodId, 
                        _order.ShippingMethodId);
                    
                    // если тип цен от кол-ва существует, то скорее всего было уже применено
                    if (priceRuleByAmount != null)
                        continue; 
                }
                
                var rule = PriceRuleService.GetPriceRuleByCartSum(offer.OfferId, sum);
                if (rule == null)
                    continue;

                orderItem.Price =
                    OrderItemPriceService.CalculateFinalPriceByPriceRule(
                        orderItem,
                        rule,
                        offer,
                        _order,
                        _order.OrderCurrency,
                        customerGroup);
            }
        }
    }
}