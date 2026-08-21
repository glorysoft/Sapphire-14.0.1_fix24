using System;
using System.Web.Mvc;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Diagnostics;
using AdvantShop.MobileApp;

namespace AdvantShop.Areas.Api.Attributes
{
    /// <summary>
    /// Логируем запрос для моб приложения в бд для истории и статистики
    /// </summary>
    public class LogMobileAppRequestAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;

            var context = filterContext.HttpContext;
            
            if (context != null && context.Request != null)
            {
                try
                {
                    var (ipBytes, ip) = context.TryGetIpBytes();
                    if (ipBytes != null)
                    {
                        var url = context.Request.RawUrl;
                        var userId = context.Request.Headers["X-API-USER-ID"]?.TryParseGuid(true);
                        var appId = context.Request.Headers["X-API-APP-ID"]?.TryParseGuid(true);

                        MobileAppRequestHistoryService.Log(
                            ipBytes, 
                            ip, 
                            url, 
                            userId, 
                            null, 
                            null, 
                            null, 
                            null, 
                            appId);
                    }
                }
                catch (Exception ex)
                {
                    Debug.Log.Error(ex);
                }
            }
        }
    }
}