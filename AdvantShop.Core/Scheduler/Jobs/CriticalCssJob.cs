using AdvantShop.Core.Scheduler.QuartzJobLogging;
using AdvantShop.CriticalCss;
using Quartz;

namespace AdvantShop.Core.Scheduler.Jobs
{
    public class CriticalCssJob : IJob
    {
        public void Execute(IJobExecutionContext context)
        {
            // Первая часть условия необходима для запуска из web.config
            if (context.JobDetail.JobDataMap.Get(TaskManager.DataMap) is TaskSetting 
                && !context.CanStart())
            {
                context.LogInformation("context.CanStart() is false");
                return;
            }
            
            if (CriticalCssStateManager.IsRun)
            {
                context.LogInformation("CriticalCssStateManager.IsRun is still true");
                return;
            }
            
            context.TryRun(() => CriticalCssService.Process(context));
            
            context.WriteLastRun();
        }
    }
}