using AdvantShop.Catalog;
using AdvantShop.Configuration;

namespace AdvantShop.CriticalCss
{
    public static class CriticalCssNames
    {
        private const string MainPrefix = "Main";
        private const string BrandPrefix = "Brand";
        private const string CartPrefix = "Cart";
        private const string CatalogPrefix = "Catalog";
        private const string CatalogSearchPrefix = "CatalogSearch";
        private const string CheckoutPrefix = "Checkout";
        private const string ComparePrefix = "Compare";
        private const string ErrorPrefix = "Error";
        private const string FeedbackPrefix = "Feedback";
        private const string GiftCertificatePrefix = "GiftCertificate";
        private const string RecoveryPasswordPrefix = "RecoveryPassword";
        private const string LoginPrefix = "Login";
        private const string MyAccountPrefix = "MyAccount";
        private const string NewsPrefix = "News";
        private const string ProductPrefix = "Product";
        private const string ProductListPrefix = "ProductList";
        private const string StaticPagePrefix = "StaticPage";
        private const string WishlistPrefix = "Wishlist";
        private const string LandingPrefix = "Landing";
        private const string BonusCardPrefix = "BonusCard";
        private const string NewsItemPrefix = "NewsItem";
        private const string BrandItemPrefix = "BrandItem";
        private const string CheckoutSuccessPrefix = "CheckoutSuccess";
        
        private const string MainParamsTemplate = "__PageMode_{0}";
        private const string CatalogParamsTemplate = "__ViewMode_{0}";
        private const string ProductListParamsTemplate = "__Type_{0}__List_{1}";
        private const string StaticPageParamsTemplate = "__UrlPath_{0}";
        private const string LandingSiteParamsTemplate = "__SiteUrl_{0}";
        private const string LandingParamsTemplate = "__LandingUrl_{0}";

        public static string GetMainName(SettingsDesign.eMainPageMode pageMode) => 
            string.Format(MainPrefix + MainParamsTemplate, pageMode.ToString());
        
        public static string GetBrandName() =>
            string.Format(BrandPrefix);
        
        public static string GetCartName() =>
            string.Format(CartPrefix);
        
        public static string GetCatalogName(ProductViewMode viewMode) =>
            string.Format(CatalogPrefix + CatalogParamsTemplate, viewMode.ToString());
        
        public static string GetCatalogSearchName() =>
            string.Format(CatalogSearchPrefix);
        
        public static string GetCheckoutName() =>
            string.Format(CheckoutPrefix);
        
        public static string GetCompareName() =>
            string.Format(ComparePrefix);

        public static string GetErrorName() =>
            string.Format(ErrorPrefix);
        
        public static string GetFeedbackName() =>
            string.Format(FeedbackPrefix);

        public static string GetGiftCertificateName() =>
            string.Format(GiftCertificatePrefix);
        
        public static string GetRecoveryPasswordName() =>
            string.Format(RecoveryPasswordPrefix);
        
        public static string GetLoginName() =>
            string.Format(LoginPrefix);
        
        public static string GetMyAccountName() =>
            string.Format(MyAccountPrefix);
        
        public static string GetNewsName() =>
            string.Format(NewsPrefix);
        
        public static string GetProductName() =>
            string.Format(ProductPrefix);
        
        public static string GetProductListName(EProductOnMain type, string list = null) =>
            string.Format(ProductListPrefix + ProductListParamsTemplate, type, list ?? string.Empty);
        
        public static string GetStaticPageName(string url) =>
            string.Format(StaticPagePrefix + StaticPageParamsTemplate, url);
        
        public static string GetWishlistName() =>
            string.Format(WishlistPrefix);

        public static string GetLandingSiteName(string url) =>
            string.Format(LandingPrefix + LandingSiteParamsTemplate, url);
        
        public static string GetLandingName(string siteUrl, string url) =>
            string.Format(GetLandingSiteName(siteUrl) + LandingParamsTemplate, url);

        public static string GetBonusCardName() =>
            string.Format(BonusCardPrefix);

        public static string GetNewsItemName() =>
            string.Format(NewsItemPrefix);
        
        public static string GetBrandItemName() =>
            string.Format(BrandItemPrefix);
        
        public static string GetCheckoutSuccessName() =>
            string.Format(CheckoutSuccessPrefix);
    }
}
