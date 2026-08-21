using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.CMS;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Core.Services.Landing.Settings;
using AdvantShop.CriticalCss.DTOs;
using AdvantShop.CriticalCss.Enums;
using AdvantShop.News;

namespace AdvantShop.CriticalCss
{
    public static partial class CriticalCssService
    {
        public static Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> GetAllBundles()
        {
            var bundles = new Dictionary<string, IEnumerable<CriticalCssBundlePathDto>>();

            foreach (var type in Enum.GetValues(typeof(CriticalCssType)).Cast<CriticalCssType>())
                switch (type)
                {
                    case CriticalCssType.Main:
                        GetMainBundles(bundles);
                        break;
                    case CriticalCssType.Brand:
                        GetBrandBundles(bundles);
                        break;
                    case CriticalCssType.Cart:
                        GetCartBundles(bundles);
                        break;
                    case CriticalCssType.Catalog:
                        GetCatalogBundles(bundles);
                        break;
                    case CriticalCssType.CatalogSearch:
                        GetCatalogSearchBundles(bundles);
                        break;
                    case CriticalCssType.Checkout:
                        GetCheckoutBundles(bundles);
                        break;
                    case CriticalCssType.Compare:
                        GetCompareBundles(bundles);
                        break;
                    case CriticalCssType.Error:
                        GetErrorBundles(bundles);
                        break;
                    case CriticalCssType.Feedback:
                        GetFeedbackBundles(bundles);
                        break;
                    case CriticalCssType.GiftCertificate:
                        GetGiftCertificateBundles(bundles);
                        break;
                    case CriticalCssType.RecoveryPassword:
                        GetRecoveryPasswordBundles(bundles);
                        break;
                    case CriticalCssType.Login:
                        GetLoginBundles(bundles);
                        break;
                    /*case CriticalCssType.MyAccount:
                        GetMyAccountBundles(bundles);
                        break;*/
                    case CriticalCssType.News:
                        GetNewsBundles(bundles);
                        break;
                    case CriticalCssType.Product:
                        GetProductBundles(bundles);
                        break;
                    case CriticalCssType.ProductList:
                        GetProductListBundles(bundles);
                        break;
                    case CriticalCssType.StaticPage:
                        GetStaticPageBundles(bundles);
                        break;
                    case CriticalCssType.Wishlist:
                        GetWishlistBundles(bundles);
                        break;
                    case CriticalCssType.Landing:
                        GetLandingBundles(bundles);
                        break;
                    case CriticalCssType.Module:
                        GetModuleBundles(bundles);
                        break;
                    case CriticalCssType.BonusCard:
                        GetBonusCardBundles(bundles);
                        break;
                    case CriticalCssType.NewsItem:
                        GetNewsItemBundles(bundles);
                        break;
                    case CriticalCssType.BrandItem:
                        GetBrandItemBundles(bundles);
                        break;
                    case CriticalCssType.CheckoutSuccess:
                        GetCheckoutSuccessBundles(bundles);
                        break;
                }

            return bundles;
        }

        private static void GetMainBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetMainName(SettingsDesign.eMainPageMode.Default),
                CriticalCssLinks.GetMainLinks(SettingsDesign.eMainPageMode.Default)
                    .Select(link => new CriticalCssBundlePathDto(link))
            );

            bundles.Add(
                CriticalCssNames.GetMainName(SettingsDesign.eMainPageMode.TwoColumns),
                CriticalCssLinks.GetMainLinks(SettingsDesign.eMainPageMode.TwoColumns)
                    .Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetBrandBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetBrandName(),
                CriticalCssLinks.GetBrandLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetCartBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetCartName(),
                CriticalCssLinks.GetCartLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetCatalogBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            var categoryUrls = CategoryService.GetCategoriesUrlPathsForCriticalCss();

            if (categoryUrls == null || !categoryUrls.Any()) return;

            bundles.Add(
                CriticalCssNames.GetCatalogName(ProductViewMode.Tile),
                CriticalCssLinks.GetCatalogLinks(categoryUrls, ProductViewMode.Tile)
                    .Select(link => new CriticalCssBundlePathDto(link))
            );

            bundles.Add(
                CriticalCssNames.GetCatalogName(ProductViewMode.List),
                CriticalCssLinks.GetCatalogLinks(categoryUrls, ProductViewMode.List)
                    .Select(link => new CriticalCssBundlePathDto(link))
            );

            bundles.Add(
                CriticalCssNames.GetCatalogName(ProductViewMode.Table),
                CriticalCssLinks.GetCatalogLinks(categoryUrls, ProductViewMode.Table)
                    .Select(link => new CriticalCssBundlePathDto(link))
            );

            bundles.Add(
                CriticalCssNames.GetCatalogName(ProductViewMode.Single),
                CriticalCssLinks.GetCatalogLinks(categoryUrls, ProductViewMode.Single)
                    .Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetCatalogSearchBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetCatalogSearchName(),
                CriticalCssLinks.GetCatalogSearchLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetCheckoutBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetCheckoutName(),
                CriticalCssLinks.GetCheckoutLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetCompareBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetCompareName(),
                CriticalCssLinks.GetCompareLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetErrorBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetErrorName(),
                CriticalCssLinks.GetErrorLinks().Select(link => new CriticalCssBundlePathDto(link)
                {
                    ExpectedStatusCode = 404,
                })
            );
        }

        private static void GetFeedbackBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetFeedbackName(),
                CriticalCssLinks.GetFeedbackLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetGiftCertificateBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetGiftCertificateName(),
                CriticalCssLinks.GetGiftCertificateLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetRecoveryPasswordBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetRecoveryPasswordName(),
                CriticalCssLinks.GetRecoveryPasswordLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetLoginBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetLoginName(),
                CriticalCssLinks.GetLoginLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetMyAccountBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetMyAccountName(),
                CriticalCssLinks.GetMyAccountLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetNewsBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetNewsName(),
                CriticalCssLinks.GetNewsLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetProductBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            var productUrl = ProductService.GetFirstProduct()?.UrlPath;

            if (string.IsNullOrWhiteSpace(productUrl)) return;

            bundles.Add(
                CriticalCssNames.GetProductName(),
                CriticalCssLinks.GetProductLinks(productUrl).Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetProductListBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            var existsBestProducts = ProductOnMain.IsExistsProductByType(EProductOnMain.Best);
            var existsNewProducts = ProductOnMain.IsExistsProductByType(EProductOnMain.New);
            var existsSaleProducts =  ProductOnMain.IsExistsProductByType(EProductOnMain.Sale);
            
            foreach (var type in 
                     Enum.GetValues(typeof(EProductOnMain))
                         .Cast<EProductOnMain>()
                         .Where(type =>
                         {
                             switch (type)
                             {
                                 case EProductOnMain.Best 
                                     when !SettingsCatalog.BestEnabled || !existsBestProducts:
                                 case EProductOnMain.New 
                                     when !SettingsCatalog.NewEnabled || !existsNewProducts:
                                 case EProductOnMain.NewArrivals 
                                     when !SettingsCatalog.NewEnabled 
                                          || !SettingsCatalog.DisplayLatestProductsInNewOnMainPage 
                                          || existsNewProducts:
                                 case EProductOnMain.Sale 
                                     when !SettingsCatalog.SalesEnabled || !existsSaleProducts:
                                 case EProductOnMain.None:
                                     return false;
                             }
                             
                             return true;
                         }))
                switch (type)
                {
                    case EProductOnMain.Best:
                    case EProductOnMain.New:
                    case EProductOnMain.NewArrivals:
                    case EProductOnMain.Sale:
                        bundles.Add(
                            CriticalCssNames.GetProductListName(type, null),
                            CriticalCssLinks.GetProductListLinks(type, null)
                                .Select(link => new CriticalCssBundlePathDto(link))
                        );
                        break;
                    case EProductOnMain.List:
                        var lists = ProductListService.GetList();

                        if (lists == null || lists.Count == 0) break;

                        foreach (var list in ProductListService.GetList().Where(list => list?.Enabled == true))
                            bundles.Add(
                                CriticalCssNames.GetProductListName(type, list.UrlPath),
                                CriticalCssLinks.GetProductListLinks(type, list.UrlPath)
                                    .Select(link => new CriticalCssBundlePathDto(link))
                            );
                        break;
                }
        }

        private static void GetStaticPageBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            var pages = StaticPageService.GetAllStaticPages();

            if (pages == null) return;

            foreach (var page in pages)
                bundles.Add(
                    CriticalCssNames.GetStaticPageName(page.UrlPath),
                    CriticalCssLinks.GetStaticPageLinks(page.UrlPath)
                        .Select(link => new CriticalCssBundlePathDto(link))
                );
        }

        private static void GetWishlistBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            if (SettingsDesign.WishListVisibility)
                bundles.Add(
                    CriticalCssNames.GetWishlistName(),
                    CriticalCssLinks.GetWishlistLinks().Select(link => new CriticalCssBundlePathDto(link))
                );
        }

        private static void GetLandingBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            var lpSiteSettingsService = new LpSiteSettingsService();
            var lpSettingsService = new LpSettingsService();
            var landings = new LpService().GetList();

            if (landings == null || landings.Count == 0) return;

            landings = landings
                // выбираем только те страницы лендингов, где не нужна авторизация
                .Where(landing => lpSettingsService.IsAccessAllow(landing.Id)
                                  || !lpSiteSettingsService.IsAuthRequire(landing.LandingSiteId))
                .ToList();

            if (landings.Count == 0) return;

            foreach (var landing in landings)
                bundles.Add(
                    CriticalCssNames.GetLandingName(landing.SiteUrl, landing.Url),
                    CriticalCssLinks.GetLandingLinks(landing.SiteUrl, landing.Url)
                        .Select(link => new CriticalCssBundlePathDto(link))
                );
        }

        private static void GetModuleBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            foreach (var moduleType in AttachedModules.GetModules<ICriticalCss>())
            {
                var module = (ICriticalCss)Activator.CreateInstance(moduleType);
                var moduleBundles = module.Bundles();

                if (moduleBundles == null || moduleBundles.Count == 0) continue;

                bundles.AddRange(moduleBundles);
            }
        }

        private static void GetBonusCardBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            if (!BonusSystem.IsActive)
                return;
            
            bundles.Add(
                CriticalCssNames.GetBonusCardName(),
                CriticalCssLinks.GetBonusCardLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetNewsItemBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            var url = NewsService.GetFirstNewsItem()?.UrlPath;
            
            if (string.IsNullOrWhiteSpace(url)) 
                return;
            
            bundles.Add(
                CriticalCssNames.GetNewsItemName(),
                CriticalCssLinks.GetNewsItemLinks(url).Select(link => new CriticalCssBundlePathDto(link))
            );
        }

        private static void GetBrandItemBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            var url = BrandService.GetFirstBrand()?.UrlPath;
            
            if (string.IsNullOrWhiteSpace(url)) 
                return;
            
            bundles.Add(
                CriticalCssNames.GetBrandItemName(),
                CriticalCssLinks.GetBrandItemLinks(url).Select(link => new CriticalCssBundlePathDto(link))
            );
        }
        
        private static void GetCheckoutSuccessBundles(Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles)
        {
            bundles.Add(
                CriticalCssNames.GetCheckoutSuccessName(),
                CriticalCssLinks.GetCheckoutSuccessLinks().Select(link => new CriticalCssBundlePathDto(link))
            );
        }
    }
}
