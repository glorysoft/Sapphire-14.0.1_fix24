namespace AdvantShop.Core.Services.Loging.Triggers.Statistics
{
    public interface ITriggerStatistics
    {
        TriggerStatisticsDto GetStatistics();

        TriggerGraphStatisticsDto GetStatisticsGraph(TriggerStatisticsGraphQuery query);
    }
}