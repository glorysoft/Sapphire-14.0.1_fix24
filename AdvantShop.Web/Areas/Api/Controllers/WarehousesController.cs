using System.Web.Mvc;
using AdvantShop.Areas.Api.Attributes;
using AdvantShop.Areas.Api.Handlers.Warehouses;
using AdvantShop.Areas.Api.Models.Warehouses;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Areas.Api.Controllers
{
    [LogRequest, AuthApiKeyByUser, AuthUserApi, Warehouse]
    public class WarehousesController : BaseApiController
    {
        // GET api/warehouses/groups
        [HttpGet]
        public JsonResult Groups(WarehouseGroupsFilter filter) => JsonApi(new GetWarehouseGroupsApi(filter));
    }
}