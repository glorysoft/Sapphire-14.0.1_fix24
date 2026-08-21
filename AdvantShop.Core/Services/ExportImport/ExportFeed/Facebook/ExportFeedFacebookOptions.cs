using System.Collections.Generic;
using AdvantShop.Core.Services.ExportImport.ExportFeed;
using Newtonsoft.Json;

namespace AdvantShop.ExportImport
{
    public class ExportFeedFacebookOptions : BaseExportFeedFilterOptions
    {
        [JsonIgnore]
        public override int? PriceRuleId => null;
        [JsonIgnore]
        public override int? PriceRuleIdForOldPrice => null;
        [JsonIgnore]
        public override decimal? NotExportAmountCount => null;
        [JsonIgnore]
        public override bool DontExportProductsWithoutDimensionsAndWeight => false;
        [JsonIgnore]
        public override bool ConsiderMultiplicityInPrice => false;

        public override List<int> WarehouseIds => null;

        public bool RemoveHtml { get; set; }
        public string DatafeedTitle { get; set; }
        public string DatafeedDescription { get; set; }
        public string GoogleProductCategory { get; set; }
        public string ProductDescriptionType { get; set; }
        public string OfferIdType { get; set; }
        public bool ColorSizeToName { get; set; }
    }
}