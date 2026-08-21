using System;
using System.Collections.Generic;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Loging;
using AdvantShop.Core.Services.Loging.Triggers.Logs;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Models.Triggers
{
    public sealed class GetTriggerStatistics : AbstractCommandHandler<List<KeyValuePair<string, int>>>
    {
        private readonly int _triggerId;

        public GetTriggerStatistics(int triggerId)
        {
            _triggerId = triggerId;
        }

        protected override List<KeyValuePair<string, int>> Handle()
        {
            var result = new List<KeyValuePair<string, int>>();
            
            var statistics = LogStatisticsManager.GetTriggerLogger(_triggerId)?.GetStatistics();
            if (statistics != null)
            {
                foreach (var item in statistics)
                {
                    if (!Enum.TryParse(item.EventType, true, out TriggerLogEventType eventType))
                        continue;
                    
                    if (eventType == TriggerLogEventType.CallTrigger)
                        continue;
                    
                    result.Add(new KeyValuePair<string, int>(eventType.Localize(), item.Count));
                }
            }

            return result;
        }
    }
}