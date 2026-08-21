using System;
using AdvantShop.Web.Admin.Models.Triggers;
using AdvantShop.Web.Infrastructure.Admin;
using System.Linq;
using AdvantShop.Core.Services.Loging;
using AdvantShop.Core.Services.Loging.Triggers.Logs;
using AdvantShop.Web.Admin.ViewModels.Triggers;

namespace AdvantShop.Web.Admin.Handlers.Triggers
{
    public sealed class GetTriggerHistory
    {
        private readonly TriggerHistoryFilterModel _filter;

        public GetTriggerHistory(TriggerHistoryFilterModel filter)
        {
            _filter = filter;
        }

        public FilterResult<TriggerHistoryItem> Execute()
        {
            var model = new FilterResult<TriggerHistoryItem>();
            
            var filter = new TriggerLogFilterGetDto()
            {
                Page = _filter.Page,
                PageSize = _filter.ItemsPerPage,

                Level = _filter.Level != null ? (TriggerLogLevel)_filter.Level.Value : default(TriggerLogLevel?),
                EventType = _filter.EventType != null
                    ? (TriggerLogEventType)_filter.EventType.Value
                    : default(TriggerLogEventType?),
                Search = _filter.Search
            };

            var paging = LoggingManager.GetTriggerLogger(_filter.TriggerId).GetLogs(filter);
            if (paging == null)
                return model;

            model.TotalItemsCount = paging.TotalCount;
            model.DataItems = paging.Items.Select(x => new TriggerHistoryItem()
            {
                Time = x.CreatedOnUtc.ToLocalTime(),
                TriggerId = x.TriggerId,
                EventType = Enum.TryParse(x.EventType, out TriggerLogEventType eventType) ? eventType : default(TriggerLogEventType),
                Level =  Enum.TryParse(x.Level, out TriggerLogLevel level) ? level : default(TriggerLogLevel),
                ActionId = x.ActionId,
                Error = x.Error,
                Parameters = x.Parameters
            }).ToList();
            
            model.TotalPageCount = (int)(Math.Ceiling((double)model.TotalItemsCount / _filter.ItemsPerPage));
            model.TotalString = $"Найдено: {model.TotalItemsCount}";
            
            return model;
        }
    }
}
