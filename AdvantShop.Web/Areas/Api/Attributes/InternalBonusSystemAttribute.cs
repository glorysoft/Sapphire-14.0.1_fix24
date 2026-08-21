using System.Web.Mvc;
using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Web.Infrastructure.ActionResults;

namespace AdvantShop.Areas.Api.Attributes
{
    public class InternalBonusSystemAttribute : ActionFilterAttribute
    {
        public InternalBonusSystemAttribute()
        {
            Order = 10;
        }
        
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (!BonusSystem.IsInternal)
            {
                filterContext.Result = new JsonNetResult { Data = new ApiError("Активирована сторонняя бонусная система. Данный endpoint API доступен только для бонусной системы от Advantshop.") };
            }
        }

    }
}