//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Helpers;
using AdvantShop.Module.Rees46.Domain;
using AdvantShop.Configuration;
using AdvantShop.Diagnostics;

namespace AdvantShop.Module.Rees46
{
    public class Rees46 : IModuleRelatedProducts, ISearch, IRenderModuleByKey, IModuleBundles, IAdminModuleSettings
    {
        #region Module methods

        public const string ModuleStringId = "Rees46";

        string IModule.ModuleStringId
        {
            get { return ModuleStringId; }
        }

        public bool CheckAlive()
        {
            return true;
        }

        public bool InstallModule()
        {
            return Rees46Repository.InstallModule();
        }

        public bool UninstallModule()
        {
            return Rees46Repository.UninstallModule();
        }
        
        public bool UpdateModule()
        {          
            return Rees46Repository.UpdateModule();
        }
        
        public string ModuleName
        {
            get
            {
                switch (CultureInfo.CurrentCulture.TwoLetterISOLanguageName)
                {
                    case "ru":
                        return "Rees46 - Персональные рекомендации товаров";

                    case "en":
                        return "Rees46";

                    default:
                        return "Rees46";
                }
            }
        }
     

        #endregion

        #region IRenderModuleByKey

        public List<ModuleRoute> GetModuleRoutes()
        {
            return new List<ModuleRoute>()
            {
                new ModuleRoute()
                {
                    Key = "head",
                    ActionName = "GetScript",
                    ControllerName = "Rees46",
                },
                new ModuleRoute()
                {
                    Key = "body_end",
                    ActionName = "SuggestionsInSearch",
                    ControllerName = "Rees46",
                },
                new ModuleRoute()
                {
                    Key = "shoppingcart_after",
                    ActionName = "ShoppingcartAfter",
                    ControllerName = "Rees46",
                },
                new ModuleRoute()
                {
                    Key = "order_success",
                    ActionName = "CheckoutFinalStep",
                    ControllerName = "Rees46",
                },
                new ModuleRoute()
                {
                    Key = "product_right",
                    ActionName = "ProductRight",
                    ControllerName = "Rees46",
                },
                new ModuleRoute()
                {
                    Key = "category_top",
                    ActionName = "CategoryTop",
                    ControllerName = "Rees46",
                },
                new ModuleRoute()
                {
                    Key = "category_bottom",
                    ActionName = "CategoryBottom",
                    ControllerName = "Rees46",
                },
                new ModuleRoute()
                {
                    Key = "mainpage_products",
                    ActionName = "MainPage",
                    ControllerName = "Rees46",
                },
                new ModuleRoute()
                {
                    Key = "search_page_top",
                    ActionName = "Search",
                    ControllerName = "Rees46",
                }
            };
        }

        #endregion
        
        #region IModuleRelatedProducts

        public string GetRelatedProductsHtml(Product product, RelatedType relatedType)
        {
            var offer = product.Offers.OrderByDescending(x => x.Main).FirstOrDefault();

            var pageType = relatedType == RelatedType.Related ? PageType.RelatedProduct : PageType.AlternativeProduct;

            return Rees46Service.GetRecomender(pageType, offer != null ? offer.OfferId : 0);           
        }

        public List<ProductModel> GetRelatedProducts(Product product, RelatedType relatedType)
        {
            return null;
        }

        #endregion
        
        #region ISearch

        public string RenderContent(string term)
        {
            return string.Empty;
        }

        public string RenderBottom(string term)
        {
            return Rees46Service.GetRecomender(PageType.Search, searchQuery: term);
        }

        public bool OverrideStandardSearch()
        {
            return false;
        }

        #endregion

        #region IModuleBundles

        public List<string> GetCssBundles()
        {
            return null;
        }

        public List<string> GetJsBundles()
        {
            return new List<string>() {"~/modules/rees46/js/lib.js"};
        }

        #endregion

        #region IAdminModuleSettings
        public bool IsMobileAdminReady => true;

        public List<ModuleSettingTab> AdminSettings
        {
            get
            {
                return new List<ModuleSettingTab>()
                {
                    new ModuleSettingTab()
                    {
                        Title = CultureInfo.CurrentCulture.TwoLetterISOLanguageName == "ru" ? "Настройки" : "Settings",
                        Controller = "Rees46Admin",
                        Action = "Settings",
                        IsAdaptive = true
                    }
                };
            }
        }

        #endregion
    }
}