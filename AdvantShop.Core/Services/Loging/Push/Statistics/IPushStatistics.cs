namespace AdvantShop.Core.Services.Loging.Push.Statistics
{
    public interface IPushStatistics
    {
        PushStatisticsGraphDto GetStatisticsGraph(PushStatisticsGraphQuery query);
    }
}