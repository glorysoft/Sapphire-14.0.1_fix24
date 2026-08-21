using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.Templates
{
    public class GetAuthMethodsHandler : ICommandHandler<List<AuthMethod>>
    {
        private List<IModuleAuthorization> _modules = new List<IModuleAuthorization>();
        private List<AuthMethod> _authMethods = SettingsAuth.AuthMethods;
        
        public List<AuthMethod> Execute()
        {
            GetModules();
            AddTitle();
            return _authMethods;
        }
            
        private void GetModules()
        {
            foreach (var moduleType in AttachedModules.GetModules<IModuleAuthorization>())
            {
                var module = (IModuleAuthorization)Activator.CreateInstance(moduleType, null);

                _modules.Add(module);
            }
        }

        private void AddTitle()
        {
            foreach (var authMethod in _authMethods)
                authMethod.Title = authMethod.Type == EAuthMethod.Module
                    ? string.Format("{0} ({1})",
                        authMethod.Type.Localize(),
                        _modules.FirstOrDefault(module =>
                            module.ModuleStringId == authMethod.ModuleId)?.ModuleName ?? string.Empty)
                    : authMethod.Type.Localize();
        }
    }
}