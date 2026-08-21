using System;
using System.Collections.Generic;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Loging.Triggers.Logs;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AdvantShop.Core.Services.Loging.Triggers.Statistics
{
    public class TriggerGraphStatisticsDto : List<TriggerActionStatisticsDto>
    {
    }

    public sealed class TriggerActionStatisticsDto
    {
        public int? ActionId { get; set; }
        
        [JsonConverter(typeof(StringEnumConverter))]
        public TriggerLogEventType EventType { get; set; }
        
        public List<TriggerLevelStatisticsDto> Levels { get; set; }
    }

    public class TriggerLevelStatisticsDto
    {
        [JsonConverter(typeof(StringEnumConverter))]
        public TriggerLogLevel Level { get; set; }
        
        public string LevelStr => Level.Localize();
        
        public List<TriggerDayStatisticsDto> Data { get; set; }
    }

    public sealed class TriggerDayStatisticsDto
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }
}