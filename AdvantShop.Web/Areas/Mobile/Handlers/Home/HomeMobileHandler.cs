using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AdvantShop.Areas.Mobile.Models.Home;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Customers;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Extensions;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Mobile.Handlers.Home
{
    public class HomeMobileHandler : ICommandHandler<HomeMobileViewModel>
    {
        private int _countNew;
        private readonly int _itemsCount = SettingsMobile.MainPageProductsCount;
        private readonly HomeMobileViewModel _model = new HomeMobileViewModel
        {
            CategoriesUrl = new List<SelectListItem>
            {
                new SelectListItem
                {
                    Text = LocalizationService.GetResource("Home.Index.Catalog"),
                    Value = "catalog/"
                }
            },
            MainPageCatalogView = SettingsMobile.MainPageCatalogView
        };
        private readonly UrlHelper _urlHelper;
        private bool _loadCatalog;
        public HomeMobileHandler(bool loadCatalog)
        {
            _urlHelper = new UrlHelper(HttpContext.Current.Request.RequestContext);
            _loadCatalog = loadCatalog;
        }
        
        public HomeMobileViewModel Execute()
        {
            GetCountNew();
            GetCategoriesUrl();
            GetCatalog();
            if (_itemsCount > 0)
            {
                AddBaseProductLists();
                AddAdditionalProductLists();
                SortProductLists();
            }
            
            if (CustomerContext.CurrentCustomer.IsAdmin)
                Track.TrackService.TrackEvent(Track.ETrackEvent.Trial_VisitMobileVersion);

            ReferralService.ApplyReferralProgram(null, true);

            return _model;
        }

        private void GetCategoriesUrl()
        {
            var url = new UrlHelper(HttpContext.Current.Request.RequestContext);

            foreach (var category in CategoryService.GetChildCategoriesByCategoryId(0, warehouseIds: WarehouseContext.GetAvailableWarehouseIds()).Where(cat => cat.Enabled && !cat.Hidden))
            {
                _model.CategoriesUrl.Add(new SelectListItem
                {
                    Text = category.Name,
                    Value = url.RouteUrl("category", new { url = category.UrlPath }, url.RequestContext.HttpContext.Request.Url?.Scheme)
                });
            }
        }
        
        private void AddAdditionalProductLists()
        {
            var productLists = ProductListService.GetMainPageList();
            
            foreach (var productList in productLists)
            {
                var products = 
                    ProductListService.GetProducts(
                        productList.Id, 
                        _itemsCount,
                        WarehouseContext.GetAvailableWarehouseIds());
                
                if (products.Count > 0)
                {
                    var productListModel = new ProductViewModel(products, true)
                    {
                        Type = EProductOnMain.List,
                        Id = productList.Id,
                        Title = productList.Name,
                        ShowBriefDescription = SettingsMobile.ShowBriefDescriptionInMainMobile,
                        SortOrder = productList.SortOrder,
                        UrlPath = productList.UrlPath,
                        LinkText = LocalizationService.GetResource("Home.MainPageProducts.AllProducts"),
                    };
                    
                    _model.ProductLists.Add(productListModel);
                }
            }
        }

        private void GetCountNew()
        {
            _countNew = SettingsCatalog.NewEnabled
                ? ProductOnMain.GetProductCountByType(EProductOnMain.New)
                : 0;
            
            if (_countNew == 0 
                && SettingsCatalog.NewEnabled 
                && SettingsCatalog.DisplayLatestProductsInNewOnMainPage)
            {
                _model.HideNewProductsLink = true;
                _model.NewArrivals = true;
            } 
        }

        private void AddBaseProductLists()
        {
            _model.ProductLists.Add(PrepareProductModel(EProductOnMain.Best, _itemsCount));
            _model.ProductLists.Add(_countNew > 0
                ? PrepareProductModel(EProductOnMain.New, _itemsCount)
                : PrepareProductModel(EProductOnMain.NewArrivals, _itemsCount));
            _model.ProductLists.Add(PrepareProductModel(EProductOnMain.Sale, _itemsCount));
        }
        
        private static ProductViewModel PrepareProductModel(EProductOnMain type, int itemsCount)
        {
            var urlHelper = new UrlHelper(HttpContext.Current.Request.RequestContext);
            if (!CheckEnableBaseProductList(type))
            {
                var emptyListModel = new ProductViewModel(null, true) 
                {
                    ShowBriefDescription = SettingsMobile.ShowBriefDescriptionInMainMobile,
                    UrlPath = urlHelper.AbsoluteClientRouteUrl("ProductList", new { type })
                };    
                
                SetBasePropsList(type, emptyListModel);
                
                return emptyListModel;
            }
            
            var products = 
                ProductOnMain.GetProductsByType(
                    type, 
                    itemsCount,
                    WarehouseContext.GetAvailableWarehouseIds());
            
            var model = new ProductViewModel(products, true)
            {
                Type = type,
                ShowBriefDescription = SettingsMobile.ShowBriefDescriptionInMainMobile,
                UrlPath = urlHelper.AbsoluteClientRouteUrl("ProductList", new { type })
            };
            
            SetBasePropsList(type, model);
            
            return model;
        }

        private static void SetBasePropsList(EProductOnMain type, ProductViewModel model)
        {
            switch (type)
            {
                case EProductOnMain.Best:
                    model.Title = LocalizationService.GetResource("Home.MainPageProducts.BestSellersTitle");
                    model.SortOrder = SettingsCatalog.BestSorting;
                    model.LinkText = LocalizationService.GetResource("Home.MainPageProducts.BestSellersAllLink");
                    break;
                
                case EProductOnMain.New:
                case EProductOnMain.NewArrivals:
                    model.Title = LocalizationService.GetResource("Home.MainPageProducts.NewProductsTitle");
                    model.SortOrder = SettingsCatalog.NewSorting;
                    model.LinkText = LocalizationService.GetResource("Home.MainPageProducts.NewProductsAllLink");
                    break;
                
                case EProductOnMain.Sale:
                    model.Title = LocalizationService.GetResource("Home.MainPageProducts.SalesTitle");
                    model.SortOrder = SettingsCatalog.SalesSorting;
                    model.LinkText = LocalizationService.GetResource("Home.MainPageProducts.SalesAllLink");
                    break;
            }
        }

        private static bool CheckEnableBaseProductList(EProductOnMain type)
        {
            switch (type)
            {
                case EProductOnMain.Best:
                    return SettingsCatalog.BestEnabled && SettingsCatalog.ShowBestOnMainPage;
                case EProductOnMain.New:
                    return SettingsCatalog.NewEnabled && SettingsCatalog.ShowNewOnMainPage;
                case EProductOnMain.NewArrivals:
                    return SettingsCatalog.NewEnabled && SettingsCatalog.DisplayLatestProductsInNewOnMainPage && SettingsCatalog.ShowNewOnMainPage;
                case EProductOnMain.Sale:
                    return SettingsCatalog.SalesEnabled && SettingsCatalog.ShowSalesOnMainPage;
                default:
                    return false;
            } 
        }
        
        private void SortProductLists() =>
            _model.ProductLists = _model.ProductLists
                .OrderBy(list => list.SortOrder)
                .ToList();

        private void GetCatalog()
        {
            if (!_loadCatalog)
                return;

            var categories = CategoryService.GetChildCategoriesByCategoryId(0, false, WarehouseContext.GetAvailableWarehouseIds()).Take(SettingsCatalog.MaximumItemsInMenu).OrderBy(x => x.SortOrder);
            
            foreach (var category in categories)
            {
                var products = ProductService.GetProductsByCategory(category.CategoryId,
                    Math.Min(100, SettingsCatalog.ProductsPerPage), category.Sorting, false, WarehouseContext.GetAvailableWarehouseIds());

                var productViewModel = new ProductViewModel(products, true)
                {
                    Type = EProductOnMain.None,
                    Id = category.CategoryId,
                    Title = category.Name,
                    CountProductsInLine = SettingsDesign.CountMainPageProductInLine,
                    ShowBriefDescription = SettingsMobile.ShowBriefDescriptionInMainMobile,
                    LinkText = LocalizationService.GetResource("Home.MainPageProducts.AllProducts"),
                    UrlPath = _urlHelper.RouteUrl("Category", new { url = category.UrlPath }),
                };
                _model.ProductLists.Add(productViewModel);
            }
        }
    }
}
