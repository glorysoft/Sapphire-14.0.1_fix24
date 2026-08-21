using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Configuration.Settings.Enums;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Customers;
using AdvantShop.Web.Infrastructure.Extensions;

namespace AdvantShop.Web.Infrastructure.Filters
{
    public sealed class StoreAccessAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (AppServiceStartAction.state != PingDbState.NoError
                || filterContext.IsChildAction)
                return;

            switch (SettingsMain.StoreAccessMode)
            {
                case EStoreAccessMode.NoOne:
                    NoOneAccessProcessing(filterContext);
                    return;
                case EStoreAccessMode.AuthenticatedCustomer:
                    AuthenticatedCustomerAccessProcessing(filterContext);
                    return;
                case EStoreAccessMode.All:
                default:
                    return;
            }
        }

        private static void NoOneAccessProcessing(ActionExecutingContext filterContext)
        {
            var controller = (string)filterContext.RouteData.Values["controller"];
            var action = (string)filterContext.RouteData.Values["action"];

            if (controller.Equals("Common", StringComparison.OrdinalIgnoreCase)
                && (action.Equals("ClosedStore", StringComparison.OrdinalIgnoreCase)
                    || action.Equals("KeepAlive", StringComparison.OrdinalIgnoreCase)))
                return;

            var customer = CustomerContext.CurrentCustomer;
            if (customer != null && !customer.IsAdmin && !customer.IsModerator)
                filterContext.Result = new RedirectToRouteResult("Closed", null);
        }

        private static void AuthenticatedCustomerAccessProcessing(ActionExecutingContext filterContext)
        {
            var url = string.Empty;
            var controller = (string)filterContext.RouteData.Values["controller"];

            if (CustomerContext.CurrentCustomer?.CustomerRole != Role.Guest)
                return;
            
            if (filterContext.HttpContext.Request.IsJsonResult())
                return;

            if (controller.Equals("User", StringComparison.OrdinalIgnoreCase)
                || controller.Equals("Common", StringComparison.OrdinalIgnoreCase)
                || controller.Equals("CommonExt", StringComparison.OrdinalIgnoreCase)
                || IsFromLanding(filterContext.ActionParameters))
                return;

            if (!string.IsNullOrEmpty(SettingsMain.NoAccessRedirectUrl))
                url = SettingsMain.NoAccessRedirectUrl;
            else
            {
                var urlParams = new
                {
                    from = filterContext.HttpContext.Request.Url?.AbsolutePath,
                };
                
                url = UrlService.GetAbsoluteLink(
                    new UrlHelper(HttpContext.Current.Request.RequestContext).AbsoluteRouteUrl("Login", urlParams)
                );
            }
            
            filterContext.Result = new RedirectResult(url);
        }

        private static bool IsFromLanding(IDictionary<string, object> values)
        {
            if (values.TryGetValue("from", out var fromValue) 
                && values.TryGetValue("landingId", out var landingIdValue))
            {
                var from = fromValue.ToString();
                var landingId = landingIdValue.ToString();

                if (!string.IsNullOrWhiteSpace(from)
                    && from.Equals("landing", StringComparison.OrdinalIgnoreCase)
                    && !string.IsNullOrWhiteSpace(landingId))
                    return true;
            }
            
            return false;
        }
    }
}