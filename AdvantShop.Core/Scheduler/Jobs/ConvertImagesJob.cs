using AdvantShop.Core.Scheduler.QuartzJobLogging;
using AdvantShop.Images.ImageConvertor;
using Quartz;

namespace AdvantShop.Core.Scheduler.Jobs
{
    public class ConvertImagesJob : IJob
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
            
            if (ImageConvertorStateManager.IsRun)
            {
                context.LogInformation("ImageConvertorStateManager.IsRun is still true");
                return;
            }
            
            context.TryRun(() => ImageConvertor.StartConvert(context));

            context.WriteLastRun();
        }
    }
}