using System.Collections.Generic;

namespace AdvantShop.Core.Services.Loging.Triggers.Statistics
{
    public sealed class TriggerStatisticsDto : List<TriggerStatisticsItem>
    {
    }
    
    public sealed class TriggerStatisticsItem
    {
        public string EventType { get; set; }
        public int Count { get; set; }
    }
}