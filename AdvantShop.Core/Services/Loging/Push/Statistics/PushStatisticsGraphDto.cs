using System;
using System.Collections.Generic;
using AdvantShop.Core.Common.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AdvantShop.Core.Services.Loging.Push.Statistics
{
    public sealed class PushStatisticsGraphDto : List<PushStatusStatisticsDto>
    {
        
    }
    
    public sealed class PushStatusStatisticsDto
    {
        [JsonConverter(typeof(StringEnumConverter))]
        public PushStatus Status { get; set; }
        
        public string StatusStr => Status.Localize();
        
        public List<TriggerPushDayStatisticsDto> Data { get; set; }
    }

    public sealed class TriggerPushDayStatisticsDto
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }
}