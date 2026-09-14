using AdvantShop.Core.Modules;

namespace AdvantShop.Module.YandexSearch.Core
{
    public class YandexSearchSettings
    {
        private static string ModuleID
        {
            get { return YandexProductSearch.ModuleID; }
        }

        public static string ApiKey
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("ApiKey", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("ApiKey", value, ModuleID); }
        }

        public static string SearchId
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("SearchId", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("SearchId", value, ModuleID); }
        }

        public static bool IdIsArtNo
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("IdIsArtNo", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("IdIsArtNo", value, ModuleID); }
        }

        public static int SearchMaxItems
        {
            get { return ModuleSettingsProvider.GetSettingValue<int>("SearchMaxItems", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("SearchMaxItems", value, ModuleID); }
        }
        
        public static string Url
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("Url", ModuleID)?.TrimEnd('/'); }
            set { ModuleSettingsProvider.SetSettingValue("Url", value, ModuleID); }
        }
    }
}
