namespace AdvantShop.CriticalCss.Params
{
    public sealed class CriticalCssLandingParams : CriticalCssParams
    {
        public string SiteUrl { get; set; }
        
        public string Url { get; set; }

        public CriticalCssLandingParams()
        {
            var siteUrlValue = GetUrlParameter("url");
            var urlValue = GetUrlParameter("lpUrl");
            
            SiteUrl = siteUrlValue;
            Url = urlValue;
        }
    }
}