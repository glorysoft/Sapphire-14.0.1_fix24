using System.Collections.Generic;
using AdvantShop.Core.Services.Catalog;

namespace AdvantShop.Models.ProductDetails
{
    public sealed class GetPriceAmountListDto
    {
        public int ProductId { get; set; }
        public int OfferId { get; set; }
        public PriceAmountListSource Source { get; set; }
    }

    public enum PriceAmountListSource : byte
    {
        Product = 0,
        Catalog = 1
    }
    
    public sealed class GetPriceAmountListResponse
    {
        public List<PriceRuleAmountListItem> AmountList { get; set; }
        
        public List<PriceRuleAmountListItem> CartSumList { get; set; }
    }
}