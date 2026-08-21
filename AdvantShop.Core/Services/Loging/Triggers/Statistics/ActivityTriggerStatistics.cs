using AdvantShop.Configuration;

namespace AdvantShop.Core.Services.Loging.Triggers.Statistics
{
    public class ActivityTriggerStatistics : ITriggerStatistics
    {
        private readonly int _triggerId;
        private readonly ActivityRequest _activityService;

        public ActivityTriggerStatistics(int triggerId)
        {
            _triggerId = triggerId;
            _activityService = new ActivityRequest(LinkService.Internal.ActivityTriggerLogService + "/");
        }

        public TriggerStatisticsDto GetStatistics() =>
            _activityService.Get<TriggerStatisticsDto>($"api/v1/statistics/{_triggerId}");

        public TriggerGraphStatisticsDto GetStatisticsGraph(TriggerStatisticsGraphQuery query) =>
            _activityService.Get<TriggerGraphStatisticsDto>(
                $"api/v1/statistics/{_triggerId}/graph?dateFrom={query.DateFrom:u}&dateTo={query.DateTo:u}");
    }
}