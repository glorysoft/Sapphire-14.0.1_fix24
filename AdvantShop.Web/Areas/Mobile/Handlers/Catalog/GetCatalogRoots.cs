using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AdvantShop.Areas.Mobile.Models.Catalog;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Web.Infrastructure.Extensions;

namespace AdvantShop.Areas.Mobile.Handlers.Catalog
{
    public class GetCatalogRoots
    {
        private List<Category> _categories;
        private readonly UrlHelper _urlHelper;
        private SettingsMobile.eViewCategoriesOnMain _viewMode;
        private int? _limitCount;
        
        public GetCatalogRoots(SettingsMobile.eViewCategoriesOnMain viewMode, int? limitCount = null)
        {
            _urlHelper = new UrlHelper(HttpContext.Current.Request.RequestContext);
            _viewMode = viewMode;
            _limitCount = limitCount;
        }

        public CatalogMenuModel Execute()
        {
            var warehouseIds = WarehouseContext.GetAvailableWarehouseIds();
            
            var adaptiveRootCategoryId = CategoryService.GetAdaptiveRootCategoryId();
            
            _categories = CategoryService.GetChildCategoriesByCategoryId(adaptiveRootCategoryId, warehouseIds: warehouseIds);

            if (_limitCount.HasValue)
            {
                _categories = _categories.Take(_limitCount.Value).ToList();
            }
            
            var model = new CatalogMenuModel
            {
                Items =
                    CacheManager.Get(CacheNames.MenuCatalog + "_mobile_root_categories" +
                                     (warehouseIds != null ? string.Join(",", warehouseIds) : null),
                        () => GetCategoryItems(adaptiveRootCategoryId, 0)),
                ViewMode = _viewMode,
                PhotoWidth = SettingsPictureSize.IconCategoryImageWidth,
                PhotoHeight = SettingsPictureSize.IconCategoryImageHeight,
                IsFixedCategoriesOnMain = SettingsMobile.IsFixedCategoriesOnMain || SettingsDesign.OnePageCatalog,
                ShowProductsCount = SettingsCatalog.ShowProductsCount
            };

            return model;
        }

        private List<CatalogMenuItem> GetCategoryItems(int parentCategoryId, int level)
        {
            if (level == 4)
                return null;

            var list = new List<CatalogMenuItem>();
            
            foreach (var category in _categories.Where(x => x.ParentCategoryId == parentCategoryId && x.Enabled && !x.Hidden).OrderBy(x => x.SortOrder))
            {
                var item = new CatalogMenuItem()
                {
                    Name = category.Name,
                    Url = _urlHelper.RouteUrl("Category", new { url = category.UrlPath }),
                    SubItems = GetCategoryItems(category.CategoryId, level + 1),
                    Icon = category.Icon,
                    SmallPicture = category.MiniPicture,
                    ProductsCount = SettingsCatalog.ShowOnlyAvalible
                        ? category.Available_Products_Count
                        : category.ProductsCount
                };

                list.Add(item);
            }

            return list;
        }
    }
}