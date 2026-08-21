using Newtonsoft.Json;

namespace AdvantShop.Web.Admin.Models.Modules
{
    public class ChangeEnabledModel
    {
        [JsonProperty("saasAndPaid")]
        public bool SaasAndPaid { get; set; }
    }
}