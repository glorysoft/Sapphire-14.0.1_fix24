using System.Web.Mvc;
using AdvantShop.Core.Services.Admin;
using AdvantShop.Core.UrlRewriter;

namespace AdvantShop.Web.Infrastructure.Filters
{
    public class AdminAreaRedirectAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.IsChildAction ||
                filterContext.RequestContext.HttpContext.Request.RequestType == "POST")
                return;

            if (filterContext.RequestContext.HttpContext.Request.Url == null)
                return;


            var requestPathAndQuery = filterContext.RequestContext.HttpContext.Request.Url.PathAndQuery;
            var index = requestPathAndQuery.IndexOf('?');
            var requestPathWithoutQuery = index > 0 ? requestPathAndQuery.Substring(0, index) : requestPathAndQuery;

            if (requestPathWithoutQuery.Contains("adminv2")) //&& AdminAreaTemplate.Template != "adminv2")
            {
                filterContext.Result =
                    new RedirectResult(
                        UrlService.GetUrl(requestPathAndQuery.Replace("adminv2", "adminv3"))); // AdminAreaTemplate.Template
            }
        }
    }
}