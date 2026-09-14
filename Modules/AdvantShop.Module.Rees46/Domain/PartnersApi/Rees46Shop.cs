using Newtonsoft.Json;

namespace AdvantShop.Module.Rees46.Domain.PartnersApi
{
    public class Rees46Shop
    {
        [JsonProperty(PropertyName = "api_key")]
        public string ApiKey { get; set; }

        [JsonProperty(PropertyName = "api_secret")]
        public string ApiSecret { get; set; }

        [JsonProperty(PropertyName = "url")]
        public string Url { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "category")]
        public int Category { get; set; }

        [JsonProperty(PropertyName = "yml_file_url")]
        public string YmlFileUrl { get; set; }

        [JsonProperty(PropertyName = "cms_id")]
        public int? CmsId { get; set; }

        [JsonProperty(PropertyName = "currency_id")]
        public int CurrencyId { get; set; }

        [JsonProperty(PropertyName = "billing_currency_id")]
        public int BillingCurrencyId { get; set; }

        [JsonProperty(PropertyName = "yml_notification")]
        public bool? YmlNotification { get; set; }
        

        [JsonProperty(PropertyName = "promocode")]
        public string Promocode { get; set; }
    }

    public class Rees46ShopKeys
    {
        [JsonProperty(PropertyName = "shop_key")]
        public string ShopKey { get; set; }

        [JsonProperty(PropertyName = "shop_secret")]
        public string SecretKey { get; set; }
    }
}
