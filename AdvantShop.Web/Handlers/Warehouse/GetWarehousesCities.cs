using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Models.Warehouse;
using AdvantShop.Repository;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.Warehouse
{
    public class GetWarehousesCities: ICommandHandler<List<WarehouseCityModel>>
    {
        public List<WarehouseCityModel> Execute()
        {
            var model = new List<WarehouseCityModel>();
            
            foreach (var warehouse in WarehouseService.GetList(enabled: true))
            {
                if (!warehouse.CityId.HasValue)
                    continue;
                
                var warehouseCityModel = new WarehouseCityModel()
                {
                    City = warehouse.CityId.HasValue
                        ? CityService.GetCity(warehouse.CityId.Value)?.Name
                        : null,
                    CityId = warehouse.CityId.HasValue
                        ? warehouse.CityId
                        : 0,
                };

                var exist = model.Exists(it => it.Equals(warehouseCityModel));

                if (!exist)
                {
                    model.Add(warehouseCityModel);
                }
            }

            return model;
        }
    }
}