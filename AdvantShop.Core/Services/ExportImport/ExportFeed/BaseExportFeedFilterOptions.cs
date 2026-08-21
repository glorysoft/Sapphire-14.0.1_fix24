using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.ExportImport;
using AdvantShop.Repository;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace AdvantShop.Core.Services.ExportImport.ExportFeed
{
    public abstract class BaseExportFeedFilterOptions : IExportFeedFilterOptions
    {
        public virtual bool AllowPreOrderProducts { get; set; }

        public virtual bool OnlyMainOfferToExport { get; set; }

        public virtual int? PriceRuleId { get; set; }

        public virtual int? PriceRuleIdForOldPrice { get; set; }

        public virtual decimal? NotExportAmountCount { get; set; }

        public virtual bool DontExportProductsWithoutDimensionsAndWeight { get; set; }

        public virtual string Currency { get; set; }

        public virtual decimal? PriceFrom { get; set; }

        public virtual decimal? PriceTo { get; set; }

        public virtual bool ConsiderMultiplicityInPrice { get; set; }

        public virtual List<int> WarehouseIds { get; set; }

        public virtual bool ExportNotAvailable { get; set; }

        private string _warehouseCity;
        [JsonIgnore]
        public string WarehouseCity
        {
            get
            {
                if (_warehouseCity.IsNotEmpty())
                    return _warehouseCity;

                if (WarehouseIds == null || WarehouseIds.Count == 0)
                    return _warehouseCity = SettingsMain.City;

                var warehouse = WarehouseService.GetList()
                    .FirstOrDefault(x => x.CityId.HasValue && WarehouseIds.Contains(x.Id));
                if (warehouse == null || !warehouse.CityId.HasValue)
                    return _warehouseCity = SettingsMain.City;

                var city = CityService.GetCity(warehouse.CityId.Value);
                return _warehouseCity = city.Name;
            }
        }
    }
}
