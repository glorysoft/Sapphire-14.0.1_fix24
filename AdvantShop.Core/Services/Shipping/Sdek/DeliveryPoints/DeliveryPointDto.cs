using System.Collections.Generic;

namespace AdvantShop.Shipping.Sdek.DeliveryPoints
{
    public class DeliveryPointDto
    {
        public string Code { get; set; }
        public string Type { get; set; }
        public int CityCode { get; set; }
        public string CityFias { get; set; }
        public string Address { get; set; }
        public string AddressComment { get; set; }
        public float Latitude { get; set; }
        public float Longitude { get; set; }
        public string WorkTimeStr { get; set; }
        public List<TimeWork> TimeWork { get; set; }
        public string[] Phones { get; set; }
        public bool HaveCashless { get; set; }
        public bool HaveCash { get; set; }
        public bool AllowedCod { get; set; }
        public float? WeightMin { get; set; }
        public float? WeightMax { get; set; }
        public float? MaxHeight { get; set; }
        public float? MaxWidth { get; set; }
        public float? MaxLength { get; set; }
    }
}