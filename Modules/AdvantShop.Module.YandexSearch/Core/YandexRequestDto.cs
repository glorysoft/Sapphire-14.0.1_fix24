using Newtonsoft.Json;

namespace AdvantShop.Module.YandexSearch
{
    /// <summary>
    /// https://tech.yandex.ru/site/api/concepts/catalogue_concept_-docpage/
    /// </summary>
    class YandexRequestDto
    {
        [JsonProperty("apikey")]
        public string Apikey { get; set; }

        [JsonProperty("searchid")]
        public string SearchId { get; set; }

        [JsonProperty("text")]
        public string Text { get; set; }

        [JsonProperty("per_page")]
        public int PerPage { get; set; }

        [JsonProperty("how")]
        public YandexRequestSort? How { get; set; }

        [JsonProperty("price_low")]
        public float PriceLow { get; set; }

        [JsonProperty("price_high")]
        public float PriceHigh { get; set; }

        //public string category_id { get; set; }
        //public string r_param_ { get; set; }

        [JsonProperty("available")]
        public bool Available { get; set; }
    }
}
