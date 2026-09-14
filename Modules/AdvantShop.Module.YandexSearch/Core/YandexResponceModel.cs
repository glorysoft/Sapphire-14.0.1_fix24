using Newtonsoft.Json;
using System.Collections.Generic;

namespace AdvantShop.Module.YandexSearch
{
    public class YandexResponceModel
    {
        [JsonProperty("documents")]
        public List<YandexResponceDocument> Documents { get; set; }

        [JsonProperty("categoryList")]
        public List<YandexResponceCategory> CategoryList { get; set; }

        [JsonProperty("misspell")]
        public YandexResponceMisspell Misspell { get; set; }

        [JsonProperty("page")]
        public int Page { get; set; }

        [JsonProperty("perPage")]
        public int PerPage { get; set; }

        //[JsonProperty("rangeParameters")]
        //public object RangeParameters { get; set; }

        //[JsonProperty("enumParameters")]
        //public object EnumParameters { get; set; }

        [JsonProperty("docsTotal")]
        public int DocsTotal { get; set; }
    }
}
