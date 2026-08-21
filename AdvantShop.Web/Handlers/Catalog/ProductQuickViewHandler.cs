using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using AdvantShop.App.Landing.Extensions;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Landing.Blocks;
using AdvantShop.Core.Services.Landing.Forms;
using AdvantShop.Customers;
using AdvantShop.Handlers.ProductDetails;
using AdvantShop.Repository.Currencies;
using AdvantShop.ViewModel.ProductDetails;
using AdvantShop.ViewModel.ProductDetailsLanding;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.Catalog
{
    public class ProductQuickViewHandler : 
        ICommandHandler<
            (ProductDetailsViewModel, 
            ProductDetailsViewModelLanding, 
            Product, Category, 
            List<string>)
        >
    {
        private readonly int _productId;
        private readonly int? _color;
        private readonly int? _size;
        private readonly string _from;
        private readonly int? _landingId;
        private readonly bool? _hideShipping;
        private readonly bool? _showLeadButton;
        private readonly int? _blockId;
        private readonly bool? _showVideo;
        private readonly string _descriptionMode;
        private readonly SettingsDesign.eCartAddTypeButton _cartAddType;
        private readonly int? _offerId;
        
        private Product _product;
        private Category _category;
        private List<string> _offerArtNos;

        private ProductDetailsViewModel _model = new ProductDetailsViewModel();
        private ProductDetailsViewModelLanding _modelProduct = null;

        public ProductQuickViewHandler(
            int productId, 
            int? color, 
            int? size, 
            string from, 
            int? landingId,
            bool? hideShipping, 
            bool? showLeadButton, 
            int? blockId, 
            bool? showVideo, 
            string descriptionMode,
            SettingsDesign.eCartAddTypeButton cartAddType,
            int? offerId = null
        )
        {
            _productId = productId;
            _color = color;
            _size = size;
            _from = from;
            _landingId = landingId;
            _hideShipping = hideShipping;
            _showLeadButton = showLeadButton;
            _blockId = blockId;
            _showVideo = showVideo;
            _descriptionMode = descriptionMode;
            _cartAddType = cartAddType;
            _offerId = offerId;
        }

        public (ProductDetailsViewModel, ProductDetailsViewModelLanding, Product, Category, List<string>) Execute()
        {
            Load();
            Validate();
            Build();
            AdditionalMethods();
            return (_model, _modelProduct, _product, _category, _offerArtNos);
        }

        public void Load()
        {
            _product = ProductService.GetProduct(_productId);

            if (_product != null)
            {
                _category = CategoryService.GetCategory(_product.CategoryId);
                _offerArtNos = _product.Offers.Select(x => x.ArtNo).ToList();
            }
        }

        public void Validate()
        {
            if (_product == null || _category == null || _offerArtNos == null)
                throw new BlException("Не удалось получить данные");
        }
        
        public void Build()
        {
            _model = new GetProductHandler(_product, _color, _size, null, _offerId).Get();
            _model.AllowReviews = false;
            _model.CartAddTypeButton = _cartAddType;
            _model.ShowBriefDescription = true;
            //model.ShowDescription = true;
            _model.LandingId = _landingId;
            _model.HideShipping = _hideShipping != null && _hideShipping.Value;
            
            if (_from == "landing")
            {
                SettingsDesign.IsMobileTemplate = false;
                _model.ShowLeadButton = _showLeadButton;
                _model.BlockId = _blockId;
                _model.ShowVideo = _showVideo;
                _model.DescriptionMode = _descriptionMode;

                if (_blockId != null)
                {
                    var block = new LpBlockService().Get(_blockId.Value);
                    if (block != null)
                    {
                        _model.ShowAddButton = block.TryGetSetting("show_button_quickview") == null ||
                                               block.TryGetSetting("show_button_quickview") == true;

                        _model.LpButton = block.TryGetSetting<LpButton>("button");
                        
                        _model.HidePrice = SettingsCatalog.HidePrice;
                        _model.LpShowPrice = block.TryGetSetting("show_price") == true;
                    }
                }

                _modelProduct = new ProductDetailsViewModelLanding(_model);
            }
        }

        public void AdditionalMethods()
        {
            RecentlyViewService.SetRecentlyView(CustomerContext.CustomerId, _product.ProductId);
        }
    }
}