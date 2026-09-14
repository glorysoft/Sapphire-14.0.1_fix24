using Newtonsoft.Json;

namespace AdvantShop.Module.YandexSearch
{
    public class YandexResponceMisspell
    {
        [JsonProperty("reask")]
        public YandexResponceMisspellItem Reask { get; set; }

        [JsonProperty("misspell")]
        public YandexResponceMisspellItem Misspell { get; set; }
    }
}
