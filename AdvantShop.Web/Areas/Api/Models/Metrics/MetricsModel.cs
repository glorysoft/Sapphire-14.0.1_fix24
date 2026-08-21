using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AdvantShop.Areas.Api.Models.Metrics
{
    public sealed class MetricsDto
    {
        [JsonProperty("appVersion")]
        public string AppVersion { get; set; }
        
        [JsonProperty("device")]
        [JsonConverter(typeof(DeviceMetricsConverter))]
        public DeviceMetricsBase Device { get; set; }
        
        [JsonProperty("locale")]
        public LocaleMetricsDto Locale { get; set; }
        
        [JsonProperty("screen")]
        public ScreenMetricsDto Screen { get; set; }
    }
    
    public class DeviceMetricsBase
    {
        public virtual bool IsAndroid { get; set; }
        public virtual string DeviceId { get; set; }
    }

    public sealed class IosDeviceMetricsDto : DeviceMetricsBase
    {
        [JsonProperty("name")]
        public string Name { get; set; }
        
        [JsonProperty("systemName")]
        public string SystemName { get; set; }
        
        [JsonProperty("systemVersion")]
        public string SystemVersion { get; set; }
        
        [JsonProperty("model")]
        public string Model { get; set; }
        
        [JsonProperty("localizedModel")]
        public string LocalizedModel { get; set; }
        
        [JsonProperty("identifierForVendor")]
        public string IdentifierForVendor { get; set; }
        
        [JsonProperty("isPhysicalDevice")]
        public bool IsPhysicalDevice { get; set; }
        
        [JsonProperty("utsName")]
        public UtsNameDeviceMetricsDto UtsName { get; set; }

        public override bool IsAndroid => false;
        public override string DeviceId => IdentifierForVendor;
    }
    
    public sealed class UtsNameDeviceMetricsDto
    {
        [JsonProperty("sysname")]
        public string Sysname { get; set; }
        
        [JsonProperty("nodename")]
        public string Nodename { get; set; }
        
        [JsonProperty("release")]
        public string Release { get; set; }
        
        [JsonProperty("version")]
        public string Version { get; set; }
        
        [JsonProperty("machine")]
        public string Machine { get; set; }
    }
    
    public sealed class AndroidDeviceMetricsDto : DeviceMetricsBase
    {
        [JsonProperty("model")]
        public string Model { get; set; }
        
        [JsonProperty("manufacturer")]
        public string Manufacturer { get; set; }
        
        [JsonProperty("brand")]
        public string Brand { get; set; }
        
        [JsonProperty("device")]
        public string Device { get; set; }
        
        [JsonProperty("id")]
        public string Id { get; set; }
        
        [JsonProperty("version")]
        public string Version { get; set; }
        
        [JsonProperty("sdkInt")]
        public int SdkInt { get; set; }
        
        [JsonProperty("board")]
        public string Board { get; set; }
        
        [JsonProperty("bootloader")]
        public string Bootloader { get; set; }
        
        [JsonProperty("display")]
        public string Display { get; set; }
        
        [JsonProperty("fingerprint")]
        public string Fingerprint { get; set; }
        
        [JsonProperty("hardware")]
        public string Hardware { get; set; }
        
        [JsonProperty("isPhysicalDevice")]
        public string IsPhysicalDevice { get; set; }
        
        [JsonProperty("product")]
        public string Product { get; set; }
        
        [JsonProperty("supportedAbis")]
        public List<String> SupportedAbis { get; set; }
        
        [JsonProperty("systemFeatures")]
        public List<String> SystemFeatures { get; set; }
        
        [JsonProperty("type")]
        public string Type { get; set; }
        
        public override bool IsAndroid => true;
        public override string DeviceId => Id;
    }
    
    public sealed class LocaleMetricsDto
    {
        [JsonProperty("languageCode")]
        public string LanguageCode { get; set; }
        
        [JsonProperty("timeZone")]
        public string TimeZone { get; set; }
        
        [JsonProperty("timeZoneOffset")]
        public int TimeZoneOffset { get; set; }
    }
    
    public sealed class ScreenMetricsDto
    {
        [JsonProperty("width")]
        public double Width { get; set; }
        
        [JsonProperty("height")]
        public double Height { get; set; }
        
        [JsonProperty("pixelRatio")]
        public double PixelRatio { get; set; }
    }
    
    public class DeviceMetricsConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType) => 
            objectType == typeof(DeviceMetricsBase);

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var jo = JObject.Load(reader);

            if (jo["identifierForVendor"] != null)
                return jo.ToObject<IosDeviceMetricsDto>(serializer);
            
            if (jo["id"] != null)
                return jo.ToObject<AndroidDeviceMetricsDto>(serializer);
            
            throw new JsonSerializationException("Unknown device format");
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            serializer.Serialize(writer, value);
        }
    }
}