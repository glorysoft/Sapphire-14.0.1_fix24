using AdvantShop.Configuration;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Models.Warehouse;
using AdvantShop.Repository;
using AdvantShop.Web.Infrastructure.Handlers;
using System.Collections.Generic;
using System.Linq;

namespace AdvantShop.Handlers.Warehouse
{
    public class GetOfferWarehousesCities : ICommandHandler<List<WarehouseCityModel>>
    {
        private readonly int _offerId;

        public GetOfferWarehousesCities(int offerId)
        {
            _offerId = offerId;
        }

        public List<WarehouseCityModel> Execute()
        {
            var model = new List<WarehouseCityModel>();
            var offerStocks = WarehouseStocksService.GetOfferStocks(_offerId);
            var showOnlyAvailable = SettingsCatalog.ShowOnlyAvailableWarehousesInProduct;

            foreach (var warehouse in WarehouseService.GetList(enabled: true))
            {
                var offerStock = offerStocks.FirstOrDefault(offerStockItem => offerStockItem.WarehouseId == warehouse.Id);
                if (showOnlyAvailable && (offerStock?.Quantity ?? 0f) <= 0f)
                    continue;
                
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