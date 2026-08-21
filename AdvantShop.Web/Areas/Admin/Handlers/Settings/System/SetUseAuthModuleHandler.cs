using System;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.System
{
    public class SetUseAuthModuleHandler : ICommandHandler
    {
        private readonly bool _useAuthModules;

        public SetUseAuthModuleHandler(bool useAuthModules) =>
            _useAuthModules = useAuthModules;


        public void Execute()
        {
            try
            {
                SettingsAuth.UseAuthModules = _useAuthModules;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex.Message, ex);
                throw new BlException(LocalizationService.GetResource("Admin.SettingsSystem.SetUseAuthModule.Error"));
            }
        }
    }
}