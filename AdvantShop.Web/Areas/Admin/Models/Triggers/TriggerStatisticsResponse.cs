using System.Collections.Generic;
using AdvantShop.Core.Services.Triggers;

namespace AdvantShop.Web.Admin.Models.Triggers
{
    public class TriggerStatisticsResponse
    {
        public List<ActionStatisticData> ActionStatistics { get; set; }
        public PushStatisticsData  PushStatistics { get; set; }
    }

    public class ActionStatisticData
    {
        public int? ActionId { get; set; }
        
        public string ActionName { get; set; }

        public TriggerStatisticsChart Chart { get; set; }

        public List<TriggerStatisticsTotal> Statistics { get; set; }
    }

    public class PushStatisticsData
    {
        public TriggerStatisticsChart Chart { get; set; }
        public List<TriggerStatisticsTotal> Statistics { get; set; }
    }

    public class TriggerStatisticsChart
    {
        public List<List<int>> Data { get; set; }
        public List<string> Labels { get; set; }
        public List<string> Series { get; set; }
        public List<string> Colors { get; set; } = new List<string>() {"#2E9DEC", "#71c73e"};
    }

    public class TriggerStatisticsTotal
    {
        public string Status { get; set; }
        public int Sum { get; set; }
    }
}