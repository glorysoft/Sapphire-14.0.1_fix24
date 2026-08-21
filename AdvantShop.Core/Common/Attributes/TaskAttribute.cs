using System;
using AdvantShop.Core.Scheduler;

namespace AdvantShop.Core.Common.Attributes
{
    public class TaskAttribute : Attribute, IAttribute<TaskSetting>
    {
        private readonly Type _job;
        private readonly int _timeInterval;
        private readonly TimeIntervalType _timeType;
        private readonly bool _enabled;
        private readonly int _timeHours;
        private readonly int _timeMinutes;

        public TaskAttribute(
            Type job, 
            int timeInterval,
            TimeIntervalType timeType,
            bool enabled = false,
            int timeHours = 0,
            int timeMinutes = 0)
        {
            _job = job;
            _timeInterval = timeInterval;
            _timeType = timeType;
            _enabled = enabled;
            _timeHours = timeHours;
            _timeMinutes = timeMinutes;
        }
        
        public TaskSetting Value => 
            new TaskSetting
            {
                JobType = $"{_job.FullName},{_job.Assembly.FullName}",
                Enabled = _enabled,
                TimeInterval = _timeInterval,
                TimeHours = _timeHours,
                TimeMinutes = _timeMinutes,
                TimeType = _timeType,
            };
    }
}