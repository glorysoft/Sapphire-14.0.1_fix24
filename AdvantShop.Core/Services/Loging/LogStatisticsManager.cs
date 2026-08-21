using AdvantShop.Core.Services.Loging.Push.Statistics;
using AdvantShop.Core.Services.Loging.Triggers.Statistics;
using AdvantShop.Saas;

namespace AdvantShop.Core.Services.Loging
{
    public class LogStatisticsManager
    {
        public static ITriggerStatistics GetTriggerLogger(int triggerId)
        {
            if (!SaasDataService.IsSaasEnabled || SaasDataService.CurrentSaasData.HaveCustomerLog)
                return new ActivityTriggerStatistics(triggerId);

            return null;
        }

        public static IPushStatistics GetPushLogger()
        {
            if (!SaasDataService.IsSaasEnabled || SaasDataService.CurrentSaasData.HaveCustomerLog)
                return new ActivityPushStatistics();

            return null;
        }
    }
}