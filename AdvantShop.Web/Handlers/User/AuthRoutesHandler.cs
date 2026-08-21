using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Models.User;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class AuthRoutesHandler : ICommandHandler<List<AuthRouteModel>>
    {
        private readonly List<AuthRouteModel> _routes = new List<AuthRouteModel>();

        public List<AuthRouteModel> Execute()
        {
            SetEmailRoute();
            SetCodeRoute();
            SetModuleRoutes();

            return _routes
                .Join(
                    SettingsAuth.AuthMethods,
                    route => new { route.Type, route.ModuleId },
                    method => new { method.Type, method.ModuleId },
                    (route, method) => new { route, method.SortOrder })
                .OrderBy(x => x.SortOrder)
                .Select(x => x.route)
                .ToList();
        }

        private void SetEmailRoute() =>
            _routes.Add(
                new AuthRouteModel
                {
                    Type = EAuthMethod.Email,
                    Method = EAuthMethod.Email.ToString().ToLower(),
                    Title = LocalizationService.GetResource("User.AuthRoutes.Email"),
                });

        private void SetCodeRoute()
        {
            if (SettingsAuth.AuthByCodeActive)
            {
                _routes.Add(
                    new AuthRouteModel
                    {
                        Type = EAuthMethod.Code,
                        Method = EAuthMethod.Code.ToString().ToLower(),
                        Title = LocalizationService.GetResource("User.AuthRoutes.Code"),
                    });
            }
        }

        private void SetModuleRoutes()
        {
            var modules = GetModules();

            foreach (var module in modules)
                _routes.Add(
                    new AuthRouteModel
                    {
                        Type = EAuthMethod.Module,
                        Method = EAuthMethod.Module.ToString().ToLower(),
                        Title = module.AuthLinkTitle(),
                        ModuleId = module.ModuleStringId,
                        ModuleControllerName = module.AuthorizationControllerName(),
                    });
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