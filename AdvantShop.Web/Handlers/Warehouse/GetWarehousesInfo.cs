using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Helpers;
using AdvantShop.Models.Warehouse;
using AdvantShop.Repository;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.Warehouse
{
    public class GetWarehousesInfo : ICommandHandler<int, List<WarehouseInfoModel>>
    {
        public List<WarehouseInfoModel> Execute(int cityId)
        {
            var model = new List<WarehouseInfoModel>();

            var warehouses = WarehouseService.GetList(enabled: true);

            var selectedWarehouses = GetWarehousesOfCity(warehouses, cityId);

            var url = UrlService.GetUrl();
            
            foreach (var warehouse in selectedWarehouses)
            {
                model.Add(new WarehouseInfoModel()
                {
                    Name = warehouse.Name,
                    Type = warehouse.TypeId.HasValue
                        ? TypeWarehouseService.Get(warehouse.TypeId.Value)?.Name
                        : null,
                    Address = StringHelper.AggregateStrings(", ", 
                        warehouse.CityId.HasValue 
                            ? CityService.GetCity(warehouse.CityId.Value)?.Name
                            : null, 
                        warehouse.Address),
                    AddressComment = warehouse.AddressComment,
                    Latitude = warehouse.Latitude,
                    Longitude = warehouse.Longitude,
                    TimeOfWorkList =  
                        TimeOfWorkService.GetWarehouseTimeOfWork(warehouse.Id)
                                         .Select(TimeOfWorkService.FormatTimeOfWork)
                                         .ToArray(),
                    Url = url + UrlService.GetLink(ParamType.Warehouse, warehouse.UrlPath),
                });
            }

            return model;
        }

        private List<Core.Services.Catalog.Warehouses.Warehouse> GetWarehousesOfCity(
            List<Core.Services.Catalog.Warehouses.Warehouse> warehouses, int cityId)
        {
            if (cityId == 0)
            {
                return warehouses;
            }

            var containElement = false;
            
            var selectedWarehouses = new List<Core.Services.Catalog.Warehouses.Warehouse>();

            foreach (var warehouse in warehouses)
            {
                if (cityId == warehouse.CityId)
                {
                    containElement = true;
                    selectedWarehouses.Add(warehouse);
                }
            }

            if (!containElement)
            {
                return warehouses;
            }

            return selectedWarehouses;
        }
    }
}