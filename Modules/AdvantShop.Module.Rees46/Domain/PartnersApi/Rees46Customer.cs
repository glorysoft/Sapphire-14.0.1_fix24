using Newtonsoft.Json;

namespace AdvantShop.Module.Rees46.Domain.PartnersApi
{
    public class Rees46Customer
    {
        [JsonProperty(PropertyName = "first_name")]
        public string FirstName { get; set; }

        [JsonProperty(PropertyName = "last_name")]
        public string LastName { get; set; }

        [JsonProperty(PropertyName = "email")]
        public string Email { get; set; }

        [JsonProperty(PropertyName = "phone")]
        public string Phone { get; set; }

        [JsonProperty(PropertyName = "country_code")]
        public string CountryCode { get { return "ru";} }
    }
}
