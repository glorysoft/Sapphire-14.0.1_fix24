using Newtonsoft.Json;
using System.Collections.Generic;

namespace AdvantShop.Module.YandexSearch
{
    public class YandexResponceDocument
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("url")]
        public string Url { get; set; }

        [JsonProperty("categoryId")]
        public int CategoryId { get; set; }

        [JsonProperty("categoryParents")]
        public List<int> CategoryParents { get; set; }

        [JsonProperty("price")]
        public float Price { get; set; }

        [JsonProperty("currencyId")]
        public string CurrencyId { get; set; }

        [JsonProperty("vendor")]
        public string Vendor { get; set; }

        [JsonProperty("origSnippet")]
        public string OrigSnippet { get; set; }

        [JsonProperty("snippet")]
        public string Snippet { get; set; }

        [JsonProperty("mobileSnippet")]
        public string MobileSnippet { get; set; }

        [JsonProperty("parameters")]
        public List<object> Parameters { get; set; }

        [JsonProperty("available")]
        public bool Available { get; set; }

        [JsonProperty("oldPrice")]
        public float? OldPrice { get; set; }
    }
}
