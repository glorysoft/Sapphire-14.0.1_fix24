namespace AdvantShop.Shipping.Measoft.DeliveryPoints
{
    public class DeliveryPointDto
    {
        public int Code { get; set; }
        public string Name { get; set; }
        public int CityCode { get; set; }
        public int RegionCode { get; set; }
        public string Address { get; set; }
        public string TravelDescription { get; set; }
        public string Comment { get; set; }
        public string Phone { get; set; }
        public float? Latitude { get; set; }
        public float? Longitude { get; set; }
        public string WorkTimeStr { get; set; }
        public float? MaxWeight { get; set; }
        public bool AcceptCard { get; set; }
        public bool AcceptCash { get; set; }
        public int ParentCode { get; set; }
    }
}