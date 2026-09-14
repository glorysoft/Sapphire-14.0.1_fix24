using Newtonsoft.Json;

namespace AdvantShop.Module.Rees46.Domain.PartnersApi
{
    public class ResponsesApi
    {
        public ResponsesApi()
        {
            status = false;
        }

        public bool status { get; set; }

        public string data { get; set; }

        [JsonProperty(PropertyName = "error")]
        public string message { get; set; }
    }
}
