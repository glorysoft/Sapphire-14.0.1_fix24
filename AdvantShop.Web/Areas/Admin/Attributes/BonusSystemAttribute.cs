using System.Web.Mvc;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Controllers.Shared;

namespace AdvantShop.Web.Admin.Attributes
{
    public class BonusSystemAttribute : ActionFilterAttribute
    {
        private readonly string _bonusSystemKey;

        public BonusSystemAttribute(string bonusSystemKey)
        {
            _bonusSystemKey = bonusSystemKey;
        }
        
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (BonusSystem.CurrentBonusSystemKey != _bonusSystemKey)
            {
                var customer = CustomerContext.CurrentCustomer;
                if (customer.Enabled 
                    && (customer.IsAdmin || customer.IsModerator)
                    // для sa показываем
                    && !customer.IsVirtual && !CustomerContext.IsDebug)
                {
                    if (filterContext.IsChildAction)
                        filterContext.Result = new EmptyResult();
                    else
                        filterContext.Result = (ViewResult)new ServiceController().GetBonusSystem(_bonusSystemKey, filterContext.IsChildAction);
                }
            }
        
            base.OnActionExecuting(filterContext);
        }
    }
}