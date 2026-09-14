using AdvantShop.Core.Scheduler;
using Quartz;

namespace AdvantShop.Module.RemindAboutReceipt.Service
{
    [DisallowConcurrentExecution]
    public class RemindAboutJob : IJob
    {
        public void Execute(IJobExecutionContext context)
        {
            if (!context.CanStart()) return;
            context.WriteLastRun();

            ModuleService.CheckProductsEveryThreeHours();
        }
    }
}
