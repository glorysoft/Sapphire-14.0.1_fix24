using Newtonsoft.Json;

namespace AdvantShop.Module.Rees46.Domain.PartnersApi
{
    public class Rees46Currency
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Symbol { get; set; }
        public bool Payable { get; set; }

        [JsonProperty(PropertyName = "min_payment")]
        public decimal MinPayment { get; set; }
    }
}