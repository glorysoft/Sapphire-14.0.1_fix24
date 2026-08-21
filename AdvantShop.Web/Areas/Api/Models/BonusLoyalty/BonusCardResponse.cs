using AdvantShop.Areas.Api.Models.Customers;
using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Customers;
using Newtonsoft.Json;

namespace AdvantShop.Areas.Api.Models.BonusLoyalty
{
    public class BonusCardResponse : IApiResponse
    {
        public string Number { get; }

        public decimal? Bonuses { get; }
           
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public BonusCardCustomer Customer { get; }

        public BonusCardResponse(Card bonusCard, Customer customer = null)
        {
            Number = bonusCard.Number;
            Bonuses = bonusCard.Bonuses.HasValue ? (decimal)bonusCard.Bonuses.Value : (decimal?)null;

            if (customer != null)
                Customer = new BonusCardCustomer(customer);
        }
    }
}