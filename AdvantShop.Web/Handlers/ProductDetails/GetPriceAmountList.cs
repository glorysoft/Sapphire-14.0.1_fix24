using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Customers;
using AdvantShop.Models.ProductDetails;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.ProductDetails
{
    public sealed class GetPriceAmountList : AbstractCommandHandler<GetPriceAmountListResponse>
    {
        private readonly int _productId;
        private readonly int _offerId;
        private readonly PriceAmountListSource _source;

        private Product _product;

        public GetPriceAmountList(GetPriceAmountListDto dto)
        {
            _productId = dto.ProductId;
            _offerId = dto.OfferId;
            _source = dto.Source;
        }

        protected override void Validate()
        {
            _product = ProductService.GetProduct(_productId);
            if (_product == null)
                throw new BlException("Товар не найден");
        }

        protected override GetPriceAmountListResponse Handle()
        {
            return new GetPriceAmountListResponse()
            {
                AmountList =
                    _source == PriceAmountListSource.Product && SettingsPriceRules.ShowAmountsTableInProduct
                    || _source == PriceAmountListSource.Catalog && SettingsPriceRules.ShowAmountsTableInCatalog
                        ? PriceRuleService.GetPriceRuleAmountListItems(
                            _offerId,
                            _product,
                            CustomerContext.CurrentCustomer.CustomerGroup)
                        : null,

                CartSumList =
                    _source == PriceAmountListSource.Product && SettingsPriceRules.ShowCartSumAmountsTableInProduct
                        ? PriceRuleService.GetPriceRuleCartSumAmountListItems(_offerId, _product)
                        : null
            };
        }
    }
}