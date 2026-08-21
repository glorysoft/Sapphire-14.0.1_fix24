using System.Web.Mvc;
using AdvantShop.Configuration;
using AdvantShop.Handlers.Warehouse;
using AdvantShop.Saas;
using AdvantShop.SEO;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Controllers
{
    public class WarehouseController : BaseClientController
    {
        private bool IsShowShopsPage =>
            SettingsCatalog.IsEnabledShopsPage
            && (!SaasDataService.IsSaasEnabled || SaasDataService.CurrentSaasData.HasWarehouses);
        
        public ActionResult Warehouses()
        {
            if (!IsShowShopsPage)
                return Error404();
            
            var metaInfo = MetaInfoService.GetMetaInfo(0, MetaType.PageWarehouses) 
                           ?? MetaInfoService.GetDefaultMetaInfo(MetaType.PageWarehouses, string.Empty);

            SetMetaInformation(metaInfo);
            
            return View();
        }
        
        [HttpGet]
        public ActionResult ViewWarehouse(string warehouseUrl)
        {
            if (!IsShowShopsPage)
                return Error404();
            
            var model = new GetWarehouse().Execute(warehouseUrl);
            
            if (model == null || !model.Enabled)
                return Error404();

            SetMetaInformation(model.MetaInfo, model.Name);
            
            return View(model);
        }

        public JsonResult GetWarehousesInfo(int? cityId = null)
        {
            return ProcessJsonResult(new GetWarehousesInfo(), cityId ?? 0);
        }
        
        
        public JsonResult GetWarehousesCities()
        {
            return ProcessJsonResult(new GetWarehousesCities());
        }

        public JsonResult GetOfferWarehousesCities(int offerId)
        {
            return ProcessJsonResult(new GetOfferWarehousesCities(offerId));
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult GetCartStockInWarehouses(params int[] warehousesId)
        {
            return ProcessJsonResult(new GetCartStockInWarehousesHandler(), warehousesId);
        }
    }
}