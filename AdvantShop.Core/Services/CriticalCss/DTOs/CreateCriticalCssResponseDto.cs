using System;
using Newtonsoft.Json;

namespace AdvantShop.CriticalCss.DTOs
{
    public sealed class CreateCriticalCssResponseDto
    {
        [JsonProperty("taskId")] 
        public Guid TaskId { get; set; }

        [JsonProperty("averageWaitTime")] 
        public DateTime AverageWaitTime { get; set; }

        [JsonProperty("averageWaitTimeMs")] 
        public float AverageWaitTimeMs { get; set; }
    }
}