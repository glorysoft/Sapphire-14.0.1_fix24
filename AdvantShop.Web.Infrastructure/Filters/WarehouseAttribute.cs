using System.Web.Mvc;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Saas;

namespace AdvantShop.Web.Infrastructure.Filters
{
    /// <summary>
    /// Detect current store warehouse
    /// </summary>
    public class WarehouseAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;
            
            var warehousesActive = !SaasDataService.IsSaasEnabled || SaasDataService.CurrentSaasData.HasWarehouses;
            if (!warehousesActive)
                return;

            // это нужно чтобы поставить склады по доставке
            // var controller = filterContext.RequestContext.RouteData.Values["controller"] as string;
            // if (!string.IsNullOrEmpty(controller) && controller.Equals("checkout", StringComparison.OrdinalIgnoreCase))
            // {
            //     var checkoutData = OrderConfirmationService.Get(CustomerContext.CustomerId);
            //     if (checkoutData?.WarehouseId != null)
            //     {
            //         WarehouseContext.CurrentWarehouseIds = new List<int>() { checkoutData.WarehouseId.Value };
            //         return;
            //     }
            // }
            
            WarehouseContext.SetWarehouseIdsByPriority(filterContext.HttpContext);
        }
    }
}