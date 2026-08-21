using System;

namespace AdvantShop.Core.Services.Loging.Triggers.Statistics
{
    public sealed class TriggerStatisticsGraphQuery
    {
        public DateTime DateFrom { get; }
        public DateTime DateTo { get; }
        
        public TriggerStatisticsGraphQuery(DateTime dateFrom, DateTime dateTo)
        {
            DateFrom = dateFrom;
            DateTo = dateTo;
        }
    }
}