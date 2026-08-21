using System.Web.Mvc;
using AdvantShop.Areas.Api.Attributes;
using AdvantShop.Areas.Api.Handlers.Widget;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Areas.Api.Controllers
{
    [LogRequest, AuthApiKeyByUser]
    public class WidgetController : BaseApiController
    {
        // GET api/widget/me/bonus-card
        [HttpGet, AuthUserApi, BonusSystem]
        public JsonResult MeBonusCard() => JsonApi(new MeGetBonusCard());
    
    }
}