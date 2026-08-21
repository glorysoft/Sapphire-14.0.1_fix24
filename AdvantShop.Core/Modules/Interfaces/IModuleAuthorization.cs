using System.Collections.Generic;
using System.Web.Mvc;
using AdvantShop.Core.Services.Auth.Modules;

namespace AdvantShop.Core.Modules.Interfaces
{
    public interface IModuleAuthorization : IModule
    {
        string AuthLinkTitle();
        string AuthorizationControllerName();
        bool ForbidChangePhone();
        List<AuthModuleApiMethod> ApiMethods();
    }

    public interface IModuleAuthorizationController
    {
        ActionResult Login(string redirectTo = null);
    }
}