using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Areas.Api.Models.Users;
using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Users
{
    public class AuthModulesMethodsHandler : AbstractCommandHandler<AuthModulesMethodsResponse>
    {
        private List<IModuleAuthorization> _modules;
        
        protected override void Load()
        {
            _modules = GetModules();
        }

        protected override AuthModulesMethodsResponse Handle()
        {
            var authModules = new List<AuthModuleModel>();
            
            foreach (var module in _modules)
            {
                var moduleApiMethods = module.ApiMethods();

                if (moduleApiMethods != null && moduleApiMethods.Count > 0)
                    authModules.Add(new AuthModuleModel
                    {
                        Module = module.ModuleStringId,
                        Title = module.AuthLinkTitle(),
                        IsDefault = string.Compare(
                            module.ModuleStringId, 
                            SettingsAuth.DefaultAuthModuleId, 
                            StringComparison.OrdinalIgnoreCase) == 0,
                        Methods = moduleApiMethods,
                    });
            }

            return new AuthModulesMethodsResponse(authModules);
        }
        
        private List<IModuleAuthorization> GetModules()
        {
            var modules = new List<IModuleAuthorization>();

            foreach (var moduleType in AttachedModules.GetModules<IModuleAuthorization>())
            {
                var module = (IModuleAuthorization)Activator.CreateInstance(moduleType, null);

                if (SettingsAuth.EnabledAuthModuleIds.Any(moduleId => moduleId == module.ModuleStringId))
                    modules.Add(module);
            }

            return modules;
        }
    }
}