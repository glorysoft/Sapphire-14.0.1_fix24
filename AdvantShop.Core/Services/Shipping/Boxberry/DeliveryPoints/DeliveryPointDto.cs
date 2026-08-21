namespace AdvantShop.Core.Services.Shipping.Boxberry.DeliveryPoints
{
    public class DeliveryPointDto
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string CityCode { get; set; }
        public string Address { get; set; }
        public string TripDescription { get; set; }
        public float Latitude { get; set; }
        public float Longitude { get; set; }
        public string WorkShedule { get; set; }
        public string Phone { get; set; }
        public bool OnlyPrepaidOrders { get; set; }
        public bool Acquiring { get; set; }
        public float? WeightMax { get; set; }
        public float? VolumeLimit { get; set; }
    }
}