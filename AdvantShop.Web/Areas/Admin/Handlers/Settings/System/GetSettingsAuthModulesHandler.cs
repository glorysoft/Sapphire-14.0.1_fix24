using AdvantShop.Configuration;
using AdvantShop.Web.Admin.Models.Settings.System;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.System
{
    public class GetSettingsAuthModulesHandler : ICommandHandler<SettingsAuthModulesModel>
    {
        private SettingsAuthModulesModel _model;

        public SettingsAuthModulesModel Execute()
        {
            Build();
            
            return _model;
        }
        
        private void Build() =>
            _model = new SettingsAuthModulesModel
            {
                UseAuthModules = SettingsAuth.UseAuthModules,
            };
    }
}