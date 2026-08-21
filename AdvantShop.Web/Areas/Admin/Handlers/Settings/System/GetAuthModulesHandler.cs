using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Web.Admin.Models.Settings.System;
using AdvantShop.Web.Infrastructure.Admin;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.System
{
    public class GetAuthModulesHandler : ICommandHandler<FilterResult<AuthModuleModel>>
    {
        private readonly FilterResult<AuthModuleModel> _result = new FilterResult<AuthModuleModel>();
        
        public FilterResult<AuthModuleModel> Execute()
        {
            SetDataItems();

            return _result;
        }

        private void SetDataItems()
        {
            _result.DataItems = new List<AuthModuleModel>();
            
            foreach (var moduleType in AttachedModules.GetModules<IModuleAuthorization>())
            {
                var module = (IModuleAuthorization)Activator.CreateInstance(moduleType, null);
                
                _result.DataItems.Add(new AuthModuleModel
                {
                    StringId = module.ModuleStringId,
                    Name = module.ModuleName,
                    Default = 
                        string.Compare(
                            module.ModuleStringId, 
                            SettingsAuth.DefaultAuthModuleId, 
                            StringComparison.Ordinal
                        ) == 0,
                    Enabled = SettingsAuth.EnabledAuthModuleIds.Any(setting => setting == module.ModuleStringId),
                });
            }
        }
    }
}