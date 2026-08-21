using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Repository;
using Newtonsoft.Json;

namespace AdvantShop.ExportImport
{
    [Serializable()]
    public class ExportFeedResellerOptions : IExportFeedCsvFilterOptions
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public bool ExportNotAvailable { get; set; }
        public bool CsvExportNoInCategory { get; set; }
        public bool ExportFromMainCategories { get; set; }


        public string ResellerCode { get; set; }
        public string CsvEnconing { get; set; }
        public string CsvSeparator { get; set; }
        public string CsvColumSeparator { get; set; }
        public string CsvPropertySeparator { get; set; }
        public bool CsvCategorySort { get; set; }
        public List<ProductFields> FieldMapping { get; set; }
        public List<CSVField> ModuleFieldMapping { get; set; }
        public bool? UnloadOnlyMainCategory { get; set; }
        public List<int> StocksFromWarehouses { get; set; }
        [JsonIgnore]
        private string _warehouseCity;
        [JsonIgnore]
        public string WarehouseCity
        {
            get
            {
                if (_warehouseCity.IsNotEmpty())
                    return _warehouseCity;

                if (StocksFromWarehouses == null || StocksFromWarehouses.Count == 0)
                    return _warehouseCity = SettingsMain.City;

                var warehouse = WarehouseService.GetList()
                    .FirstOrDefault(x => x.CityId.HasValue && StocksFromWarehouses.Contains(x.Id));
                if (warehouse == null || !warehouse.CityId.HasValue)
                    return _warehouseCity = SettingsMain.City;

                var city = CityService.GetCity(warehouse.CityId.Value);
                return _warehouseCity = city.Name;
            }
        }
    }

    public enum EExportFeedResellerPriceMarginType
    {
        [Localize("Core.ExportImport.ExportFeedResellerOptions.PriceMarginType.Percent")]
        Percent,

        [Localize("Core.ExportImport.ExportFeedResellerOptions.PriceMarginType.AbsoluteValue")]
        AbsoluteValue
    }
}