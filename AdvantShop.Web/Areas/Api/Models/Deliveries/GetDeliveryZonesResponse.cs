using System.Collections.Generic;
using AdvantShop.Core.Services.Api;
using AdvantShop.Shipping;
using AdvantShop.Shipping.DeliveryByZones;

namespace AdvantShop.Areas.Api.Models.Deliveries
{
    public class GetDeliveryZonesResponse : List<DeliveryZonesResponseItem>, IApiResponse
    {
        public GetDeliveryZonesResponse(ICollection<DeliveryZonesResponseItem> zones)
        {
            this.AddRange(zones);
        }
    }

    public class DeliveryZonesResponseItem
    {
        public DeliveryZonesResponseItem(ShippingMethod method, DeliveryByZones deliveryByZones)
        {
            Id = method.ShippingMethodId;
            Zones = new List<DeliveryZoneResponseItem>(deliveryByZones.Zones.Count);
            
            foreach (var zone in deliveryByZones.Zones)
            {
                Zones.Add(new DeliveryZoneResponseItem(zone));
            }
        }

        public int Id { get; }

        public List<DeliveryZoneResponseItem> Zones { get;}
    }

    public class DeliveryZoneResponseItem
    {
        public DeliveryZoneResponseItem(DeliveryZone zone)
        {
            Id = zone.Id;
            Name = zone.Name;
            Description = zone.Description;
            FillColor = zone.FillColor;
            FillOpacity = zone.FillOpacity;
            StrokeColor = zone.StrokeColor;
            StrokeWidth = zone.StrokeWidth;
            StrokeOpacity = zone.StrokeOpacity;
            Coordinates = zone.Coordinates;
        }

        public int Id { get; }
        public string Name { get; }
        public string Description { get; }
        public decimal[][,] Coordinates { get; set; }
        public string FillColor { get; }
        public float FillOpacity { get; }
        public string StrokeColor { get; }
        public string StrokeWidth { get; }
        public float StrokeOpacity { get; }
    }
}