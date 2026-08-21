using AdvantShop.Configuration;

namespace AdvantShop.Core.Services.Loging.Push.Statistics
{
    public class ActivityPushStatistics : IPushStatistics
    {
        private readonly ActivityRequest _activityService =
            new ActivityRequest(LinkService.Internal.ActivityPushLogService + "/");

        public PushStatisticsGraphDto GetStatisticsGraph(PushStatisticsGraphQuery query) =>
            _activityService.Get<PushStatisticsGraphDto>($"api/v1/statistics/graph?{query}");
    }
}