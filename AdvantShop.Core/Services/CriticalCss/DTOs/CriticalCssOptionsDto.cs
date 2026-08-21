using System.Collections.Generic;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.CriticalCss.Enums;
using Newtonsoft.Json;

namespace AdvantShop.CriticalCss.DTOs
{
    public sealed class CriticalCssOptionsDto
    {
        [JsonProperty("width")] 
        public int? Width { get; set; }
        
        [JsonProperty("height")] 
        public int? Height { get; set; }
        
        [JsonProperty("deviceType")] 
        public ECriticalCssDeviceType? DeviceType { get; set; }
        
        [JsonProperty("fullPage")] 
        public bool? FullPage { get; set; }
        
        [JsonProperty("containerSelector")] 
        public string ContainerSelector { get; set; }
        
        [JsonProperty("perPageTimeoutMs")] 
        public int? PerPageTimeoutMs { get; set; }
        
        [JsonProperty("additionalUrlParams")] 
        public Dictionary<string, string> AdditionalUrlParams { get; set; }

        public CriticalCssOptionsDto()
        {
            Width = null;
            Height = null;
            DeviceType = ECriticalCssDeviceType.Desktop;
            FullPage = null;
            ContainerSelector = string.Empty;
            PerPageTimeoutMs = null;
            AdditionalUrlParams = new Dictionary<string, string>
            {
                { "debugMode", "CriticalCss" },
            };
        }

        public CriticalCssOptionsDto(CriticalCssDevice device) : this()
        {
            DeviceType = ECriticalCssDeviceTypeHelper.FromCriticalCssDevice(device);
        }
    }
}