using Newtonsoft.Json;

namespace AdvantShop.Module.Rees46.Domain.PartnersApi
{
    public class Rees46ApiKeys
    {
        [JsonProperty(PropertyName = "api_key")]
        public string ApiKey { get; set; }

        [JsonProperty(PropertyName = "api_secret")]
        public string ApiSecret { get; set; }

        public bool Duplicate { get; set; }
    }
}
