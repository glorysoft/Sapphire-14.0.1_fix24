using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace AdvantShop.CriticalCss.DTOs
{
    public sealed class CriticalCssBundleDto
    {
        [JsonProperty("name")] 
        public string Name { get; set; }

        [JsonProperty("urls")]
        [Obsolete]
        public IEnumerable<string> Urls { get; set; }
        
        [JsonProperty("paths")]
        public IEnumerable<CriticalCssBundlePathDto> Paths { get; set; }
    }
}