using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Catalog;

namespace AdvantShop.Areas.Api.Models.Products
{
    public sealed class GetPriceRuleAmountListApiResponse : IApiResponse
    {
        public GetPriceRuleAmountListApiResponse(List<PriceRuleAmountListItem> items, List<PriceRuleAmountListItem> cartSumItems = null)
        {
            Items = items?.Select(x => new PriceRuleAmountListItemApi(x)).ToList();
            CartSumItems = cartSumItems?.Select(x => new PriceRuleCartSumListItemApi(x)).ToList();
        }

        public List<PriceRuleAmountListItemApi> Items { get; }
        public List<PriceRuleCartSumListItemApi> CartSumItems { get; }
    }

    public sealed class PriceRuleAmountListItemApi
    {
        public PriceRuleAmountListItemApi(PriceRuleAmountListItem item)
        {
            Amount = item.Amount;
            Price = item.Price;
        }
        
        public string Amount { get; }
        public string Price { get; }
    }
    
    public sealed class PriceRuleCartSumListItemApi
    {
        public PriceRuleCartSumListItemApi(PriceRuleAmountListItem item)
        {
            Sum = item.Amount;
            Price = item.Price;
        }
        
        public string Sum { get; }
        public string Price { get; }
    }
}