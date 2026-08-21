using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Diagnostics;
using AdvantShop.ViewCommon;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.ProductDetails
{
    public class GetProductViewButtonsHandler : ICommandHandler<ProductViewButtonsViewModel>
    {
        private readonly int _productId;
        private readonly int _offerId;

        private readonly bool _displayBuyButton =
            SettingsCatalog.DisplayBuyButton && !SettingsCatalog.HidePrice;

        private readonly bool _displayPreOrderButton =
            SettingsCatalog.DisplayPreOrderButton && !SettingsCatalog.HidePrice;

        private readonly bool _allowBuyOutOfStockProducts =
            SettingsCheckout.OutOfStockAction == eOutOfStockAction.Cart;

        private readonly bool _allowPreOrderOutOfStockProducts =
            SettingsCheckout.OutOfStockAction == eOutOfStockAction.Preorder;

        private Offer _offer;

        private ProductViewButtonsViewModel _model = new ProductViewButtonsViewModel
        {
            BtnContent = SettingsCatalog.BuyButtonText,
            ChooseBtnContent = SettingsCatalog.ChooseBtnText,
            PreOrderButtonText = SettingsCatalog.PreOrderButtonText
        };

        public GetProductViewButtonsHandler(int productId, int offerId)
        {
            _productId = productId;
            _offerId = offerId;
        }

        public ProductViewButtonsViewModel Execute()
        {
            try
            {
                Load();
                return Handle();
            }
            catch (BlException)
            {
                return _model;
            }
            catch (Exception exception)
            {
                Debug.Log.Error(exception.Message, exception);
                return _model;
            }
        }

        private void Load()
        {
            var productDiscounts = new List<ProductDiscount>();

            var discountModules = AttachedModules.GetModuleInstances<IDiscount>();
            if (discountModules != null && discountModules.Count != 0)
                foreach (var discounts in
                         discountModules.Select(discountModule => discountModule.GetProductDiscountsList())
                             .Where(discounts => discounts != null && discounts.Count > 0))
                    productDiscounts.AddRange(discounts);

            var product = ProductService.GetProductsByOfferIds(new List<int> { _offerId }).FirstOrDefault();
            if (product == null)
            {
                var error = $@"GetProductViewButtons: Product not found. Attempted to get product by offerId={_offerId} 
via ProductService. GetProductsByOfferIds, but it returned null.";
                Debug.Log.Error(error);
                throw new BlException(error);
            }

            _offer = OfferService.GetOffer(_offerId);
            if (_offer == null)
            {
                var error = $@"GetProductViewButtons: Offer not found. Attempted to get offer by offerId={_offerId} 
via OfferService. GetOffer for productId={_productId}, but it returned null.";
                Debug.Log.Error(error);
                throw new BlException(error);
            }

            _model.Product = new ProductItem(
                product,
                DiscountByTimeService.GetCurrentDiscount(product.ProductId),
                productDiscounts
            );
        }

        private ProductViewButtonsViewModel Handle()
        {
            var allowToBuy = _allowBuyOutOfStockProducts
                             || _allowPreOrderOutOfStockProducts
                             && _model.Product.AllowPreorder;

            _model.IsAvailableForPurchase = _offer.IsAvailableForPurchase(
                _offer.Amount,
                _model.Product.GetMinAmount(),
                _offer.RoundedPrice,
                _model.Product.TotalDiscount,
                _model.Product.AllowBuyOutOfStockProducts()
            );

            var isAvailable = _model.Product.BasePrice > 0
                              && _model.Product.AmountByMultiplicity > 0
                              && _model.IsAvailableForPurchase;

            _model.ShowBuyButton = _displayBuyButton && (isAvailable || allowToBuy);
            _model.ShowPreOrderButton = _displayPreOrderButton
                                        && !_model.ShowBuyButton
                                        && !isAvailable
                                        && _model.Product.AllowPreorder
                                        && _model.Product.OfferId != 0
                                        && !_allowBuyOutOfStockProducts;


            _model.ProductUrl =
                UrlService.GetUrl(UrlService.GetLink(ParamType.Product, _model.Product.UrlPath,
                    _model.Product.ProductId, _offer.GetOfferQueryString()));
            return _model;
        }
    }
}