using System;
using AdvantShop.Catalog;

namespace AdvantShop.CriticalCss.Params
{
    public sealed class CriticalCssProductListParams : CriticalCssParams
    {
        public EProductOnMain Type { get; set; }

        public string List { get; set; }

        public CriticalCssProductListParams()
        {
            var typeValue = GetUrlParameter("type");
            var listValue = GetUrlParameter("list");

            Type = !string.IsNullOrEmpty(typeValue)
                   && Enum.TryParse<EProductOnMain>(typeValue, true, out var type)
                ? type
                : EProductOnMain.Best;

            List = listValue;
        }
    }
}