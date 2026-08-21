using System.Collections.Generic;
using Newtonsoft.Json;

namespace AdvantShop.Models.Location
{
    public class DeliveryZones : List<DeliveryZonesResponseItem>
    {
    }
    
    public class DeliveryZonesResponseItem
    {
        public DeliveryZonesResponseItem(int shippingMethodId, FeatureCollection featureCollection)
        {
            ShippingMethodId = shippingMethodId;
            FeatureCollection = featureCollection;
        }

        public int ShippingMethodId { get; }

        public FeatureCollection FeatureCollection { get;}
    }
    
    public class FeatureCollection
    {
        [JsonProperty("type")]
        public string Type => "FeatureCollection";

        [JsonProperty("metadata")]
        public MetaData MetaData { get; set; }

        [JsonProperty("features")]
        public List<Feature> Features { get; set; }
    }

    public class MetaData
    {
        [JsonProperty("creator")]
        public string Creator { get; set; }
        
        [JsonProperty("name")]
        public string Name { get; set; }
    }

    public class Feature
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("type")]
        public string Type => "Feature";

        [JsonProperty("geometry")]
        public PointGeometry Geometry { get; set; }

        [JsonProperty("properties")]
        public PolygonProperties Properties { get; set; }
    }
    
    
    public class PointGeometry
    {
        [JsonProperty("type")]
        public string Type => "Polygon";

        [JsonProperty("coordinates")]
        public decimal[][,] Coordinates { get; set; }
    }

    public class PolygonProperties
    {
        [JsonProperty("description")]
        public string Description { get; set; }
        
        [JsonProperty("deliveryTime")]
        public string DeliveryTime { get; set; }

        [JsonProperty("fillColor")]
        public string FillColor { get; set; }

        [JsonProperty("fillOpacity")]
        public float FillOpacity { get; set; }

        [JsonProperty("strokeColor")]
        public string StrokeColor { get; set; }

        [JsonProperty("strokeWidth")]
        public string StrokeWidth { get; set; }

        [JsonProperty("strokeOpacity")]
        public float StrokeOpacity { get; set; }
    }
}