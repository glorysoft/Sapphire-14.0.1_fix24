using System.Collections.Generic;
using Newtonsoft.Json;

namespace AdvantShop.CriticalCss.DTOs
{
    public sealed class ResultCriticalCssResponseDto
    {
        [JsonProperty("bundles")] 
        public Dictionary<string, string> Bundles { get; set; }
        
        [JsonProperty("errors")] 
        public Dictionary<string, List<CriticalCssPageErrorDto>> Errors { get; set; }
    }
}