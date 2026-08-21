using System;
using System.Text;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Files;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Design;
using AdvantShop.Helpers;
using AdvantShop.Web.Admin.Models.Settings;
using AdvantShop.Web.Admin.ViewModels.Settings;

namespace AdvantShop.Web.Admin.Handlers.Settings
{
    public class LoadSaveOnePageCatalogConflictSettingsHandler
    {
        public LoadSaveOnePageCatalogConflictSettingsHandler()
        {
        }
        
        public OnePageCatalogConfictSettings Get()
        {
            var model = new OnePageCatalogConfictSettings();
            model.ShowSettingSearchBlockLocation =
                SettingsDesign.SearchBlockLocation != SettingsDesign.eSearchBlockLocation.None;

            model.ShowSettingSearchByCategories = SettingsCatalog.SearchByCategories;
            model.ShowSettingShowShippingsMethodsInDetails = SettingsDesign.ShowShippingsMethodsInDetails !=
                                                             SettingsDesign.eShowShippingsInDetails.Never;

            model.ShowSettingDisplayCategoriesInBottomMenu = SettingsCatalog.DisplayCategoriesInBottomMenu;
            model.ShowSettingEnableCompareProducts = SettingsCatalog.EnableCompareProducts;
            model.ShowSettingProductReviewsVisibility = SettingsCatalog.AllowReviews;
            model.ShowSettingBuyInOneClick = SettingsCheckout.BuyInOneClick;
            model.ShowSettingRelatedProduct = SettingsCatalog.ShowRelatedProduct;
            model.ShowSettingShowCategoryTreeInBrand = SettingsCatalog.ShowCategoryTreeInBrand;
            
            model.TurnOffSearchBlockLocation = model.ShowSettingSearchBlockLocation;
            model.TurnOffSearchByCategories = model.ShowSettingSearchByCategories;
            model.TurnOffShowShippingsMethodsInDetails =
                model.ShowSettingShowShippingsMethodsInDetails;
            model.TurnOffDisplayCategoriesInBottomMenu =
                model.ShowSettingDisplayCategoriesInBottomMenu;
            model.TurnOffEnableCompareProducts = model.ShowSettingEnableCompareProducts;
            model.TurnOffProductReviewsVisibility =
                model.ShowSettingProductReviewsVisibility;
            model.TurnOffBuyInOneClick = model.ShowSettingBuyInOneClick;
            model.TurnOffRelatedProduct= model.ShowSettingRelatedProduct;
            model.TurnOffShowCategoryTreeInBrand= model.ShowSettingShowCategoryTreeInBrand;
            
            model.IsExistConflictSettings = model.ShowSettingSearchBlockLocation ||
                                  model.ShowSettingSearchByCategories ||
                                  model.ShowSettingShowShippingsMethodsInDetails ||
                                  model.ShowSettingDisplayCategoriesInBottomMenu ||
                                  model.ShowSettingEnableCompareProducts ||
                                  model.ShowSettingProductReviewsVisibility ||
                                  model.ShowSettingBuyInOneClick ||
                                  model.ShowSettingRelatedProduct ||
                                  model.ShowSettingShowCategoryTreeInBrand;
            return model;
        }

        public void Save(OnePageCatalogConfictSettings model)
        {
            if (model.TurnOffSearchBlockLocation)
            {
                SettingsDesign.SearchBlockLocation = SettingsDesign.eSearchBlockLocation.None;
            }

            if (model.TurnOffSearchByCategories)
            {
                SettingsCatalog.SearchByCategories = false;
            }

            if (model.TurnOffShowShippingsMethodsInDetails)
            {
                SettingsDesign.ShowShippingsMethodsInDetails = SettingsDesign.eShowShippingsInDetails.Never;
            }

            if (model.TurnOffDisplayCategoriesInBottomMenu)
            {
                SettingsCatalog.DisplayCategoriesInBottomMenu = false;
            }

            if (model.TurnOffEnableCompareProducts)
            {
                SettingsCatalog.EnableCompareProducts = false;
            }

            if (model.TurnOffProductReviewsVisibility)
            {
               SettingsCatalog.AllowReviews = false;
            }

            if (model.TurnOffBuyInOneClick)
            {
                SettingsCheckout.BuyInOneClick = false;
            }
            
            if (model.TurnOffRelatedProduct)
            {
                SettingsCatalog.ShowRelatedProduct = false;
            }

            if (model.TurnOffShowCategoryTreeInBrand)
            {
                SettingsCatalog.ShowCategoryTreeInBrand = false;
            }
        }
    }
}