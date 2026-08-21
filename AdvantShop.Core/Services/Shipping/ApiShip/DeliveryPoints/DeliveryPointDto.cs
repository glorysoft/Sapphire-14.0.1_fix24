using System.Collections.Generic;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping.ApiShip.DeliveryPoints
{
    public class DeliveryPointDto
    {
        public int Id { get; set; }
        public string ProviderKey { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string CountryCode { get; set; }
        public string Region { get; set; }
        public string City { get; set; }
        /// <summary>
        /// ФИАС-код города
        /// </summary>
        public string CityFias { get; set; }
        public string Community { get; set; }
        /// <summary>
        /// ФИАС-код населенного пункта
        /// </summary>
        public string CommunityFias { get; set; }
        public string Area { get; set; }
        public string Address { get; set; }
        public string Description { get; set; }
        public float Latitude { get; set; }
        public float Longitude { get; set; }
        public string Timetable { get; set; }
        public List<TimeWork> TimeWork { get; set; }
        public string Phone { get; set; }
        public bool Cod { get; set; }
        public bool PaymentCash { get; set; }
        public bool PaymentCard { get; set; }
        public byte AvailableOperation { get; set; }
        public int? MaxSizeA { get; set; }
        public int? MaxSizeB { get; set; }
        public int? MaxSizeC { get; set; }
        public int? MaxSizeSum { get; set; }
        public int? MaxWeight { get; set; }
        public int? MinWeight { get; set; }
        public int? MaxVolume { get; set; }
        public float? MaxCod { get; set; }
        public bool Enabled { get; set; }
    }
}