using System.Collections.Generic;
using AdvantShop.Shipping.Yandex.Api;

namespace AdvantShop.Shipping.Yandex.PickupPoints
{
    public class PickupPointDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public PickPointType Type { get; set; }
        public int GeoId { get; set; }
        public string Address { get; set; }
        public string AddressComment { get; set; }
        public string Instruction { get; set; }
        public float? Latitude { get; set; }
        public float? Longitude { get; set; }
        public string WorkTimeStr { get; set; }
        public List<TimeWork> TimeWork { get; set; }
        public string Phone { get; set; }
        public List<PaymentMethodType> PaymentMethods { get; set; }
        public bool IsPostOffice { get; set; }
        public bool IsMarketPartner { get; set; }
        public bool IsYandexBranded { get; set; }
        public bool IsDarkStore { get; set; }
        public bool IsFittingAllowed { get; set; }
        public bool IsPartialRefuseAllowed { get; set; }
        public bool IsPaperlessPickupAllowed { get; set; }
        public bool IsUnboxingAllowed { get; set; }
    }
}