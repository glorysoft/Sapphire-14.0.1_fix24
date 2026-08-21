using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Loging;
using AdvantShop.Core.Services.Loging.Push;
using AdvantShop.Core.Services.Loging.Push.Statistics;
using AdvantShop.Core.Services.Loging.Triggers.Logs;
using AdvantShop.Core.Services.Loging.Triggers.Statistics;
using AdvantShop.Core.Services.Triggers;
using AdvantShop.Web.Admin.Models.Triggers;

namespace AdvantShop.Web.Admin.Handlers.Triggers
{
    public sealed class GetTriggerStatisticsGraph
    {
        private readonly TriggerStatisticsGraphQueryModel _model;

        public GetTriggerStatisticsGraph(TriggerStatisticsGraphQueryModel model)
        {
            _model = model;
        }

        public TriggerStatisticsResponse Execute()
        {
            var dateFrom = _model.DateFrom;
            var dateTo = _model.DateTo;
            var days = GetDays(dateFrom, dateTo);
         
            return new TriggerStatisticsResponse()
            {
                ActionStatistics = GetTriggerActionStatistics(dateFrom, dateTo, days),
                PushStatistics = GetPushStatistics(dateFrom, dateTo, days)
            };
        }

        private List<ActionStatisticData> GetTriggerActionStatistics(DateTime dateFrom, DateTime dateTo, List<DateTime> days)
        {
            var logger = LogStatisticsManager.GetTriggerLogger(_model.TriggerId);
            if (logger == null)
                return null;

            var triggerStatistics = logger.GetStatisticsGraph(new TriggerStatisticsGraphQuery(dateFrom, dateTo));
            if (triggerStatistics == null || triggerStatistics.Count == 0)
                return null;

            var actionStatistics = new List<ActionStatisticData>();
            
            foreach (var action in triggerStatistics)
            {
                // добавление дат с 0 кол-вом
                foreach (var status in action.Levels)
                {
                    foreach (var day in days)
                        if (!status.Data.Any(x => x.Date == day))
                            status.Data.Add(new TriggerDayStatisticsDto() { Date = day });
                    
                    status.Data = status.Data.OrderBy(x => x.Date).ToList();
                }

                var actionName = GetActionName(action);

                var actionStatisticData = new ActionStatisticData()
                {
                    ActionId = action.ActionId,
                    ActionName = action.EventType.Localize() + (actionName.IsNotEmpty() ? $" \"{actionName}\"" : null),
                    Chart = new TriggerStatisticsChart()
                    {
                        Series = action.Levels.OrderBy(x => (int)x.Level).Select(x => x.LevelStr).ToList(),
                        Labels = days.Select(x => x.ToString("d MMM")).ToList(),
                        Data =
                            action.Levels
                                .OrderBy(x => (int)x.Level)
                                .Select(x => x.Data.Select(d => d.Count).ToList())
                                .ToList()
                    },
                    Statistics = action.Levels
                        .OrderBy(x => (int)x.Level)
                        .Select(x => new TriggerStatisticsTotal()
                        {
                            Status = x.LevelStr,
                            Sum = x.Data.Sum(d => d.Count)
                        }).ToList()
                };
                
                actionStatistics.Add(actionStatisticData);
            }

            return actionStatistics;
        }

        private PushStatisticsData GetPushStatistics(DateTime dateFrom, DateTime dateTo, List<DateTime> days)
        {
            var trigger = TriggerRuleService.GetTrigger(_model.TriggerId);
            if (trigger == null 
                || !trigger.Actions.Any(x => x.ActionType == ETriggerActionType.PushNotification))
                return null;
            
            var logger = LogStatisticsManager.GetPushLogger();
            if (logger == null)
                return null;

            var pushStatistics = logger.GetStatisticsGraph(new PushStatisticsGraphQuery(dateFrom, dateTo, _model.TriggerId));
            if (pushStatistics == null || pushStatistics.Count == 0)
                return null;
            
            // добавление дат с 0 кол-вом
            foreach (var pushStatistic in pushStatistics)
            {
                foreach (var day in days)
                    if (!pushStatistic.Data.Any(x => x.Date == day))
                        pushStatistic.Data.Add(new TriggerPushDayStatisticsDto() { Date = day });
                    
                pushStatistic.Data = pushStatistic.Data.OrderBy(x => x.Date).ToList();
            }

            var pushStatisticsData = new PushStatisticsData()
            {
                Chart = new TriggerStatisticsChart()
                {
                    Series = pushStatistics.OrderBy(x => (int)x.Status).Select(x => x.StatusStr).ToList(),
                    Labels = days.Select(x => x.ToString("d MMM")).ToList(),
                    Data =
                        pushStatistics
                            .OrderBy(x => (int)x.Status)
                            .Select(x => x.Data.Select(d => d.Count).ToList())
                            .ToList()
                },
                Statistics =
                    Enum.GetValues(typeof(PushStatus)).Cast<PushStatus>().Select(status =>
                        new TriggerStatisticsTotal()
                        {
                            Status = status.Localize(),
                            Sum = pushStatistics.FirstOrDefault(item => item.Status == status)?.Data.Sum(d => d.Count) ?? 0
                        }).ToList()
            };

            return pushStatisticsData;
        }

        private List<DateTime> GetDays(DateTime dateFrom, DateTime dateTo)
        {
            var days = new List<DateTime>();
            
            var day = dateFrom;
            while (day <= dateTo)
            {
                days.Add(day);
                day = day.AddDays(1);
            }
            
            return days;
        }

        private string GetActionName(TriggerActionStatisticsDto action)
        {
            string actionName = null;
            
            if (action.ActionId != null)
            {
                var triggerAction = TriggerActionService.GetTriggerAction(action.ActionId.Value);
                if (triggerAction != null)
                {
                    if (action.EventType == TriggerLogEventType.Email)
                        actionName = triggerAction.SendEmailData?.EmailSubject;
                        
                    if (action.EventType == TriggerLogEventType.Sms)
                        actionName = (triggerAction.SendSmsData?.SmsText ?? "").Reduce(100);
                        
                    if (action.EventType == TriggerLogEventType.PushNotification)
                        actionName = triggerAction.NotificationTitle;
                }
            }

            return actionName;
        }
    }
}