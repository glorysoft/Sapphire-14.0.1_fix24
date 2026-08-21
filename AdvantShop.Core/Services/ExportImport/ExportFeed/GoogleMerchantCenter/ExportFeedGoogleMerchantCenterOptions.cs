using AdvantShop.Core.Services.ExportImport.ExportFeed;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace AdvantShop.ExportImport
{
    [Serializable()]
    public class ExportFeedGoogleMerchantCenterOptions : BaseExportFeedFilterOptions
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

        [JsonProperty(PropertyName = "Currency")]
        public override string Currency { get; set; }

        [JsonProperty(PropertyName = "RemoveHtml")]
        public bool RemoveHtml { get; set; }

        [JsonProperty(PropertyName = "DatafeedTitle")]
        public string DatafeedTitle { get; set; }

        [JsonProperty(PropertyName = "DatafeedDescription")]
        public string DatafeedDescription { get; set; }

        [JsonProperty(PropertyName = "GoogleProductCategory")]
        public string GoogleProductCategory { get; set; }

        [JsonProperty(PropertyName = "ProductDescriptionType")]
        public string ProductDescriptionType { get; set; }

        [JsonProperty(PropertyName = "OfferIdType")]
        public string OfferIdType { get; set; }

        [JsonProperty(PropertyName = "ColorSizeToName")]
        public bool ColorSizeToName { get; set; }
    }
}
