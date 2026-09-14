using Newtonsoft.Json;

namespace AdvantShop.Module.YandexSearch
{
    public class YandexResponceCategory
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("value")]
        public string Value { get; set; }

        [JsonProperty("parentId")]
        public int ParentId { get; set; }

        [JsonProperty("found")]
        public int Found { get; set; }
    }
}
