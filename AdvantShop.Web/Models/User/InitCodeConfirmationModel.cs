using Newtonsoft.Json;

namespace AdvantShop.Models.User
{
    public class InitCodeConfirmationModel
    {
        [JsonProperty("type")]
        public string Type { get; set; }
        
        [JsonProperty("description")]
        public string Description { get; set; }
    }
}