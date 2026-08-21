using AdvantShop.Catalog;
using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;

namespace AdvantShop.Areas.Api.Models.Products
{
    public class GetProductPriceResponse : IApiResponse
    {
        public float? OldPrice { get; }
        public string PreparedOldPrice => OldPrice?.FormatPrice(unit: Unit);
        
        public float Price { get; }

        private string _preparedPrice;

        public string PreparedPrice
        {
            get =>
                _preparedPrice
                ?? (Price > 0
                    ? Price.FormatPrice(unit: Unit)
                    : LocalizationService.GetResource("Core.Catalog.PriceFormat.ContactWithUs"));

            private set => _preparedPrice = value;
        }

        public string Bonuses { get; }
        
        public ProductDiscountApi Discount { get; }
        
        private string Unit { get; }

        public GetProductPriceResponse(
            float? oldPrice,
            float price,
            string bonuses,
            ProductDiscountApi discount,
            string unit
        )
        {
            OldPrice = oldPrice;
            Price = price;
            Bonuses = bonuses;
            Discount = discount;
            Unit = unit;
        }

        public GetProductPriceResponse(string preparedPrice)
        {
            PreparedPrice = preparedPrice;
        }
    }
}