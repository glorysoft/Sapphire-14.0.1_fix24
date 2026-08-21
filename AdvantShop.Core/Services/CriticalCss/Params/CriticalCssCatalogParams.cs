using System;
using AdvantShop.Configuration;

namespace AdvantShop.CriticalCss.Params
{
    public sealed class CriticalCssCatalogParams : CriticalCssParams
    {
        public ProductViewMode ViewMode { get; set; }

        public CriticalCssCatalogParams()
        {
            var viewModeValue = GetUrlParameter("viewmode");

            ViewMode = !string.IsNullOrEmpty(viewModeValue)
                       && Enum.TryParse<ProductViewMode>(viewModeValue, true, out var viewMode)
                ? viewMode
                : SettingsCatalog.DefaultCatalogView;
        }
    }
}