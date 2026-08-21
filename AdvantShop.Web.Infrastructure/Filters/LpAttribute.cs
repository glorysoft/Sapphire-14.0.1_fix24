using System;
using System.Web.Mvc;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Core.Services.Landing.Settings;
using AdvantShop.Customers;
using AdvantShop.Orders;

namespace AdvantShop.Web.Infrastructure.Filters
{
    public class LpAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;

            var lpId = GetLpId(filterContext);
            if (lpId == null) 
                return;
            
            var lp = new LpService().Get(lpId.Value);
            if (lp == null)
                return;

            LpService.CurrentLanding = lp;
            
            if (LPageSettings.PriceTypeId != null)
                PriceRulesContext.CurrentPriceRuleId = LPageSettings.PriceTypeId;
        }

        private int? GetLpId(ActionExecutingContext filterContext)
        {
            if (LpService.IsCurrentDomainBelongToLanding
                && LandingHelper.IsLandingDomain(filterContext.HttpContext.Request.Url, out int lpIdByDomain))
            {
                return lpIdByDomain;
            }
            
            var lpId = filterContext.RequestContext.HttpContext.Request.Headers["X-Lp"];
            if (lpId.IsNotEmpty()) 
                return Convert.ToInt32(lpId);

            lpId = filterContext.HttpContext.Request.QueryString["lpId"];
            if (lpId.IsNotEmpty()) 
                return Convert.ToInt32(lpId);

            var controller = (string)filterContext.RouteData.Values["controller"];
            var action = (string)filterContext.RouteData.Values["action"];
            
            if (controller.Equals("Checkout", StringComparison.OrdinalIgnoreCase)
                && action.Equals("IndexPost", StringComparison.OrdinalIgnoreCase))
            {
                var current = MyCheckout.Factory(CustomerContext.CustomerId);
                if (current?.Data?.LpId != null)
                    return current.Data.LpId.Value;
            }
            
            return null;
        }
    }
}