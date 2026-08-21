using System;
using System.Web.Mvc;
using AdvantShop.Core;
using AdvantShop.Core.Services.Api;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Infrastructure.Controllers
{
    public class BaseModuleApiController : BaseController
    {
        protected JsonResult JsonApi<T>(ICommandHandler<T> handler) where T : IApiResponse
        {
            try
            {
                return JsonCamelCase(handler.Execute());
            }
            catch (BlException e)
            {
                return JsonCamelCase(new ApiError(e.Message));
            }
        }
        
        protected JsonResult JsonApi<T>(Func<T> action) where T : IApiResponse
        {
            try
            {
                return JsonCamelCase(action());
            }
            catch (BlException e)
            {
                return JsonCamelCase(new ApiError(e.Message));
            }
        }
    }
}