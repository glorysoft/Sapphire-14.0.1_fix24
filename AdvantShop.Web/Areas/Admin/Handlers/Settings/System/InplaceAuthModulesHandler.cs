using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.Web.Admin.Models.Settings.System;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.System
{
    public class InplaceAuthModulesHandler : ICommandHandler
    {
        private readonly AuthModuleModel _module;
        private readonly List<string> _enabledAuthModuleIds = SettingsAuth.EnabledAuthModuleIds;

        public InplaceAuthModulesHandler(AuthModuleModel module) =>
            _module = module;

        public void Execute()
        {
            try
            {
                Validate();
                SetDefault();
                SetEnable();
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex.Message, ex);
                throw new BlException(LocalizationService.GetResource("Admin.SettingsSystem.InplaceAuthModules.Error"));
            }
        }

        private void Validate()
        {
            if (_module == null)
                throw new BlException(
                    LocalizationService.GetResource("Admin.SettingsSystem.InplaceAuthModules.EmptyModelError"));
        }

        private void SetDefault()
        {
            if (_module.Default)
            {
                SettingsAuth.DefaultAuthModuleId = _module.StringId;

                if (!_enabledAuthModuleIds.Any(moduleId => moduleId == _module.StringId))
                {
                    _module.Enabled = true;
                }
            }
            else if (!_module.Default
                     && string.Compare(_module.StringId, SettingsAuth.DefaultAuthModuleId, StringComparison.Ordinal) ==
                     0)
                SettingsAuth.DefaultAuthModuleId = string.Empty;
        }

        private void SetEnable()
        {
            if (_module.Enabled && !_enabledAuthModuleIds.Any(moduleId => moduleId == _module.StringId))
                _enabledAuthModuleIds.Add(_module.StringId);
            else if (!_module.Enabled && !_module.Default)
                _enabledAuthModuleIds.Remove(_module.StringId);
            else if (!_module.Enabled && _module.Default)
                throw new BlException(
                    LocalizationService.GetResource("Admin.SettingsSystem.InplaceAuthModules.DisableDefaultError"));

            SettingsAuth.EnabledAuthModuleIds = _enabledAuthModuleIds;
        }
    }
}