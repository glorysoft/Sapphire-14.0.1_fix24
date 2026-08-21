namespace AdvantShop.CriticalCss.Params
{
    public sealed class CriticalCssStaticPageParams : CriticalCssParams
    {
        public string Url { get; set; }
        
        public CriticalCssStaticPageParams()
        {
            var urlValue = GetUrlParameter("url");

            Url = urlValue;
        }
    }
}