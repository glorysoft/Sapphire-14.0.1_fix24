using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.FullSearch;
using System.Collections.Generic;
using AdvantShop.Module.YandexSearch.Core;
using AdvantShop.Module.YandexSearch.Services;

namespace AdvantShop.Module.YandexSearch
{
    public class YandexProductSearch : IModuleProductSearchProvaider, IAdminModuleSettings
    {
        public const string ModuleId = "YandexProductSearch";

        #region IModule

        public static string ModuleID
        {
            get { return ModuleId; }
        }

        public string ModuleName
        {
            get { return "Яндекс.Поиск"; }
        }

        string IModule.ModuleStringId
        {
            get { return ModuleID; }
        }

        public bool CheckAlive()
        {
            return ModulesRepository.IsInstallModule(ModuleID);
        }

        public bool InstallModule()
        {
            return YandexSearchInstallationService.Install();
        }

        public bool UninstallModule()
        {
            ModuleSettingsProvider.RemoveSqlSetting("ApiKey", ModuleID);
            ModuleSettingsProvider.RemoveSqlSetting("SearchId", ModuleID);
            return true;
        }

        public bool UpdateModule()
        {
            return YandexSearchInstallationService.Update();
        }

        #endregion

        #region IAdminModuleSettings

        public bool IsMobileAdminReady => true;

        public List<ModuleSettingTab> AdminSettings
        {
            get
            {
                return new List<ModuleSettingTab>()
                {
                    new ModuleSettingTab()
                    {
                        Title = "Настройки",
                        Controller = "YandexSearchSettings",
                        Action = "Settings",
                        IsAdaptive = true
                    }
                };
            }
        }

        #endregion

        #region IModuleProductSearchProvaider
        
        public SearchResult Find(string term)
        {
            return new YandexSearchService().Find(term);
        }

        #endregion
    }
}
