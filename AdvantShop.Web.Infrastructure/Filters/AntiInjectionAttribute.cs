using System;
using System.Collections.Generic;
using System.Web.Mvc;
using AdvantShop.Core.Services.Security;
using AdvantShop.Diagnostics;

namespace AdvantShop.Web.Infrastructure.Filters
{
    /// <summary>
    /// Атрибут для анти-инъекций в тексте, если встречает вредоносный текст, то банит по ip на час.
    /// По умолчанию работает для POST запросов, если передать true, то для всех.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AntiInjectionAttribute : ActionFilterAttribute
    {
        private bool UseForAllHttpMethods { get; }

        public AntiInjectionAttribute(bool useForAllHttpMethods = false)
        {
            UseForAllHttpMethods = useForAllHttpMethods;
        }
        
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;
            
            if (filterContext.ActionParameters.Count == 0) 
                return;
            
            if (!UseForAllHttpMethods && filterContext.HttpContext.Request.RequestType != "POST")
                return;

            try
            {
                foreach (var param in filterContext.ActionParameters.Values)
                {
                    if (param == null)
                        continue;

                    if (AntiInjectionService.HasMaliciousText(param, new HashSet<object>()))
                    {
                        filterContext.Result = new HttpStatusCodeResult(400, "Bad request");
                        return;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
        }
    }
}