using AdvantShop.Core.Modules;
using AdvantShop.Module.YandexSearch.Core;

namespace AdvantShop.Module.YandexSearch.Services
{
    internal static class YandexSearchInstallationService
    {
        public static bool Install()
        {
            ModuleSettingsProvider.SetSettingValue("ApiKey", string.Empty, YandexProductSearch.ModuleID);
            ModuleSettingsProvider.SetSettingValue("SearchId", string.Empty, YandexProductSearch.ModuleID);
            
            return Update();
        }

        public static bool Update()
        {
            if (!ModuleSettingsProvider.IsSqlSettingExist("SearchMaxItems", YandexProductSearch.ModuleID))
                YandexSearchSettings.SearchMaxItems = 100;

            if (string.IsNullOrEmpty(YandexSearchSettings.Url))
                YandexSearchSettings.Url = "https://catalogapi.site.yandex.net";
            
            return true;
        }
    }
}