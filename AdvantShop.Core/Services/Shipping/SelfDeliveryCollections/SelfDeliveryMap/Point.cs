namespace AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap
{
    public struct Point
    {
        public Point(decimal latitude, decimal longitude)
        {
            Latitude = latitude;
            Longitude = longitude;
        }

        public decimal Latitude { get; }
        public decimal Longitude { get; }
    }
}