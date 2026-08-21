using System;
using AdvantShop.Configuration;

namespace AdvantShop.CriticalCss.Params
{
    public sealed class CriticalCssMainParams : CriticalCssParams
    {
        public SettingsDesign.eMainPageMode PageMode { get; set; }

        public CriticalCssMainParams()
        {
            var pageModeValue = GetUrlParameter("mainPageMode");

            PageMode = !string.IsNullOrEmpty(pageModeValue)
                       && Enum.TryParse<SettingsDesign.eMainPageMode>(pageModeValue, true, out var pageMode)
                ? pageMode
                : SettingsDesign.MainPageMode;
        }
    }
}