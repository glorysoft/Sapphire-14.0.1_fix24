using System;
using AdvantShop.MobileApp;

namespace AdvantShop.Core.Services.Loging.Push.Statistics
{
    public class PushStatisticsGraphQuery
    {
        public DateTime DateFrom { get; }
        public DateTime DateTo { get; }
        public int? SourceId { get; }
        public NotificationSourceType  SourceType { get; }
        
        public PushStatisticsGraphQuery(DateTime dateFrom, DateTime dateTo, NotificationSourceType sourceType)
        {
            DateFrom = dateFrom;
            DateTo = dateTo;
            SourceType = NotificationSourceType.Trigger;
        }

        public PushStatisticsGraphQuery(DateTime dateFrom, DateTime dateTo, int triggerId) : this(dateFrom, dateTo, NotificationSourceType.Trigger)
        {
            SourceId = triggerId;
        }

        public override string ToString()
        {
            var query = $"dateFrom={DateFrom:u}&dateTo={DateTo:u}&sourceType={SourceType.ToString().ToLower()}";
            
            if (SourceId != null)
                query += $"&sourceId={SourceId}";
            
            return query;
        }
    }
}