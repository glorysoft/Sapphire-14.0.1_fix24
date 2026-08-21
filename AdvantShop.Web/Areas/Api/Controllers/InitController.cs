using System.Web.Mvc;
using AdvantShop.Areas.Api.Attributes;
using AdvantShop.Areas.Api.Handlers.Inits;
using AdvantShop.Areas.Api.Models.Inits;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Areas.Api.Controllers
{
    [LogRequest, AuthApiKeyByUser, AuthUserApi, AntiInjection]
    public class InitController: BaseApiController
    {
        // GET init
        [HttpGet, LogMobileAppRequest]
        public JsonResult Index(InitApiModel model) => JsonApi(new InitApi(model)); 
    }
}