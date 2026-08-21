using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AdvantShop.Catalog;
using AdvantShop.Configuration;

namespace AdvantShop.CriticalCss
{
    public static class CriticalCssLinks
    {
        private static string LinkBuilder(
            string controller,
            string action,
            Dictionary<string, string> parameters = null,
            string area = null
        )
        {
            var url = string.Empty;
            
            if (!string.IsNullOrWhiteSpace(area))
                url += area + "/";

            if (!string.IsNullOrWhiteSpace(controller)
                && !controller.Equals("Home", StringComparison.OrdinalIgnoreCase))
                url += controller.ToLower() + "/";

            if (!string.IsNullOrWhiteSpace(action)
                && !action.Equals("Index", StringComparison.OrdinalIgnoreCase))
                url += action.ToLower();

            if (parameters != null && parameters.Count > 0)
                url += "?" + string.Join(
                    "&", 
                    parameters.Select(p => $"{p.Key}={HttpUtility.UrlEncode(p.Value)}"));

            return "/" + url;
        }

        public static List<string> GetMainLinks(SettingsDesign.eMainPageMode pageMode) =>
            new List<string>
            {
                LinkBuilder("Home", "Index", new Dictionary<string, string>
                {
                    { "mainPageMode", pageMode.ToString() },
                }),
            };

        public static List<string> GetBrandLinks() =>
            new List<string>
            {
                LinkBuilder("Brand", "Index"),
            };

        public static List<string> GetCartLinks() =>
            new List<string>
            {
                LinkBuilder("Cart", "Index"),
            };

        public static List<string> GetCatalogLinks(IEnumerable<string> urls, ProductViewMode viewMode) =>
            urls
                .Select(url => 
                    LinkBuilder(
                        "Catalog", 
                        "Index", 
                        new Dictionary<string, string> 
                        {
                            { "url", url },
                            { "viewmode", viewMode.ToString() },
                        }
                    )
                )
                .ToList();

        public static List<string> GetCatalogSearchLinks() =>
            new List<string>
            {
                LinkBuilder("Search", "Index", new Dictionary<string, string>
                {
                    { "q", "о" },
                }),
                LinkBuilder("Search", "Index", new Dictionary<string, string>
                {
                    { "q", "а" },
                }),
                LinkBuilder("Search", "Index", new Dictionary<string, string>
                {
                    { "q", "e" },
                }),
                LinkBuilder("Search", "Index", new Dictionary<string, string>
                {
                    { "q", "a" },
                }),
            };

        public static List<string> GetCheckoutLinks() =>
            new List<string>
            {
                LinkBuilder("Checkout", "Index"),
            };

        public static List<string> GetCompareLinks() =>
            new List<string>
            {
                LinkBuilder("Compare", "Index"),
            };

        public static List<string> GetErrorLinks() =>
            new List<string>
            {
                LinkBuilder("Error", "NotFound"),
            };

        public static List<string> GetFeedbackLinks() =>
            new List<string>
            {
                LinkBuilder("Feedback", "Index"),
            };

        public static List<string> GetGiftCertificateLinks() =>
            new List<string>
            {
                LinkBuilder("GiftCertificate", "Index"),
            };

        public static List<string> GetRecoveryPasswordLinks() =>
            new List<string>
            {
                LinkBuilder("User", "RecoveryPassword"),
            };
        
        public static List<string> GetLoginLinks() =>
            new List<string>
            {
                LinkBuilder("User", "Login"),
            };
        
        public static List<string> GetMyAccountLinks() =>
            new List<string>
            {
                LinkBuilder("MyAccount", "Index"),
            };
        
        public static List<string> GetNewsLinks() =>
            new List<string>
            {
                LinkBuilder("News", null),
            };
        
        public static List<string> GetRegistrationLinks() =>
            new List<string>
            {
                LinkBuilder("User", "Registration"),
            };
        
        public static List<string> GetProductLinks(string productUrl) =>
            new List<string>
            {
                LinkBuilder("Products", productUrl),
            };

        public static List<string> GetProductListLinks(EProductOnMain type, string list) =>
            new List<string>
            {
                LinkBuilder(null, "ProductList", new Dictionary<string, string>
                {
                    { "type", type.ToString() },
                    { "list", list }
                }),
            };

        public static List<string> GetStaticPageLinks(string url) =>
            new List<string>
            {
                LinkBuilder("StaticPage", "Index", new Dictionary<string, string>
                {
                    { "url", url }
                }),
            };

        public static List<string> GetWishlistLinks() =>
            new List<string>
            {
                LinkBuilder("Wishlist", "Index"),
            };

        public static List<string> GetLandingLinks(string siteUrl, string url) =>
            new List<string>
            {
                LinkBuilder("Landing", "Index", new Dictionary<string, string>
                {
                    { "url", siteUrl },
                    { "lpUrl", url },
                }, "Landing"),
            };

        public static List<string> GetBonusCardLinks() =>
            new List<string>
            {
                LinkBuilder(null, "GetBonusCard"),
            };

        public static List<string> GetNewsItemLinks(string url) =>
            new List<string>
            {
                LinkBuilder("News", url),
            };
        
        public static List<string> GetBrandItemLinks(string url) =>
            new List<string>
            {
                LinkBuilder("Manufacturers", url),
            };

        public static List<string> GetCheckoutSuccessLinks() =>
            new List<string>
            {
                LinkBuilder("Checkout", "Success", new Dictionary<string, string>
                {
                    { "code", Guid.Empty.ToString() }
                }),
            };
    }
}
