using System.Web.Mvc;
using System.Web.SessionState;
using AdvantShop.Core.Services.Diagnostics;
using AdvantShop.Web.Infrastructure.Extensions;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    [ExcludeFilter(typeof(AntiInjectionAttribute))]
    public partial class ModulesController : BaseClientController
    {
        public ActionResult RenderModules(string key, object routeValues = null)
        {
            if (DebugMode.IsDebugMode(eDebugMode.Modules))
                return Content("");

            var model = ModulesExtensions.GetModuleRoutes(key, routeValues);
            return PartialView("_Module", model);
        }
    }
}