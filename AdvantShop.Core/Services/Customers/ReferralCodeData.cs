using Newtonsoft.Json;

namespace AdvantShop.Core.Services.Customers
{
    public class ReferralCodeData
    {
        [JsonProperty(PropertyName = "cu", NullValueHandling = NullValueHandling.Ignore)]
        public string ReferralCustomerCode { get; set; }
        [JsonProperty(PropertyName = "co", NullValueHandling = NullValueHandling.Ignore)]
        public string ReferralCouponCode { get; set; }
        [JsonProperty(PropertyName = "h")]
        public string Hash { get; set; }
    }
}