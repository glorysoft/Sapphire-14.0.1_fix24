using System;
using System.Collections.Generic;
using AdvantShop.Core.Services.Loging.Triggers;
using AdvantShop.Core.Services.Loging.Triggers.Logs;

namespace AdvantShop.Core.Services.Triggers
{
    public class TriggerStatistics
    {
        public List<TriggerActionStatistics> ActionStatistics { get; set; }
    }
    
    public class TriggerActionStatistics
    {
        public int? ActionId { get; set; }
        public TriggerLogEventType EventType { get; set; }
        
        public List<TriggerActionStatisticsByStatus> Statuses { get; set; }
    }
    
    public class TriggerActionStatisticsByStatus
    {
        public string Status { get; set; }
        public List<DailyTriggerStatistics> Data { get; set; }
    }

    public class DailyTriggerStatistics
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }
    
    
    public class DailyTriggerLog
    {
        public DateTime Time { get; set; }
        public TriggerLogLevel Level { get; set; }
        public TriggerLogEventType EventType { get; set; } 
        public int? ActionId { get; set; }
    }
}