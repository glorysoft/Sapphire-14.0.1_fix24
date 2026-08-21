using System;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Loging.Triggers;
using AdvantShop.Core.Services.Loging.Triggers.Logs;
using AdvantShop.Localization;

namespace AdvantShop.Web.Admin.ViewModels.Triggers
{
    public sealed class TriggerHistoryItem
    {
        public int TriggerId { get; set; }

        public DateTime Time { get; set; }
        public string TimeFormatted => Culture.ConvertDate(Time);

        public TriggerLogLevel Level { get; set; }
        public string LevelFormatted => Level.ToString().ToLower();


        public TriggerLogEventType EventType { get; set; }
        public string EventTypeFormatted => EventType.Localize();

        public int? ActionId { get; set; }

        public string Error { get; set; }

        public string Parameters { get; set; }
        public string ParametersFormatted => 
            Parameters.IsNullOrEmpty() 
                ? null 
                : Parameters.TrimStart('{').TrimEnd('}');
    }
}