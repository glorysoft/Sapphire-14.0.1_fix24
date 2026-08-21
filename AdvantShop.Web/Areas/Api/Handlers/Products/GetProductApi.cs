using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Areas.Api.Models.Products;
using AdvantShop.Areas.Api.Services;
using AdvantShop.Catalog;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Products
{
    public sealed class GetProductApi : AbstractCommandHandler<GetProductResponse>
    {
        private readonly int? _id;
        private readonly string _slug;
        private readonly int? _colorId;
        private readonly int? _sizeId;
        private readonly bool? _loadWidgets;
        private Product _product;

        public GetProductApi(int id, GetProductModel model) : this(model)
        {
            _id = id;
        }
        
        public GetProductApi(string slug, GetProductModel model) : this(model)
        {
            _slug = slug;
        }
        
        private GetProductApi(GetProductModel model)
        {
            if (model != null)
            {
                _colorId = model.ColorId;
                _sizeId = model.SizeId;
                _loadWidgets = model.LoadWidgets;
            }
        }
        
        protected override void Load()
        {
            _product =
                _id != null
                    ? ProductService.GetProduct(_id.Value)
                    : _slug.IsNotEmpty()
                        ? ProductService.GetProductByUrl(_slug)
                        : null;
        }

        protected override void Validate()
        {
            if (_product == null)
                throw new BlException("Товар не найден");
        }

        protected override GetProductResponse Handle()
        {
            var warehouseIds = WarehouseContext.GetAvailableWarehouseIds();
            var warehouseId = warehouseIds?.FirstOrDefault();
            
            if (warehouseIds != null)
                _product.Offers.SetAmountByStocksAndWarehouses(warehouseIds);
            
            var model = new GetProductResponse(_product);
            
            var offerSelected = OfferService.GetMainOffer(_product.Offers, _product.AllowPreOrder, _colorId, _sizeId, warehouseId);
            if (offerSelected != null)
            {
                model.OfferSelectedId = offerSelected.OfferId;
                model.SizeColorPicker.SelectedColorId = offerSelected.ColorID;
                model.SizeColorPicker.SelectedSizeId = offerSelected.SizeID;
            }
            
            foreach (var type in AttachedModules.GetModules<IMarker>())
            {
                var module = (IMarker)Activator.CreateInstance(type);
                var markers = module.GetMarkersByProductId(_product.ProductId);

                if (markers != null && markers.Count > 0)
                {
                    if (model.Markers == null)
                        model.Markers = new List<ProductMarker>();
                    
                    model.Markers.AddRange(markers);
                }
            }

            if (_loadWidgets != null && _loadWidgets.Value)
                model.Widgets = new ModuleApiService().GetWidgets(ModuleMobileAppWidgetEndpoint.Product, _product);

            return model;
        }
    }
}