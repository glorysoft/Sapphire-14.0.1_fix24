using Newtonsoft.Json;

namespace AdvantShop.Module.YandexSearch
{
    public class YandexResponceMisspellItem
    {

        [JsonProperty("rule")]
        public MisspellItemRule Rule { get; set; }

        [JsonProperty("text")]
        public string Text { get; set; }

        [JsonProperty("sourceText")]
        public string SourceText { get; set; }
    }
}
