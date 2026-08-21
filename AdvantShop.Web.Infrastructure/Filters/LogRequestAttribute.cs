using System.Web.Mvc;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Diagnostics;
using AdvantShop.Web.Infrastructure.Extensions;

namespace AdvantShop.Web.Infrastructure.Filters
{
    /// <summary>
    /// Логируем запрос (url, headers, ip) в лог
    /// </summary>
    public class LogRequestAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;
            
            var context = filterContext.HttpContext;

            if (context != null && context.Request != null)
            {
                var data = context.Request.GetRequestRawData();
                data += " ip: " + context.TryGetIp(); 
                
                Debug.Log.Info(data);
            }
        }
    }
}
