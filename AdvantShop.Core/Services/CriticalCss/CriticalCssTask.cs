using System;
using AdvantShop.CriticalCss.DTOs;
using AdvantShop.CriticalCss.Enums;

namespace AdvantShop.CriticalCss
{
    public class CriticalCssTask
    {
        public Guid TaskId { get; set; }

        public DateTime AverageWaitTime { get; set; }

        public float AverageWaitTimeMs { get; set; }
        
        public bool IsComplite { get; set; }
        
        public CriticalCssDevice Device { get; set; }

        public CriticalCssTask(CreateCriticalCssResponseDto externalTask, CriticalCssDevice device)
        {
            TaskId = externalTask.TaskId;
            AverageWaitTime = externalTask.AverageWaitTime;
            AverageWaitTimeMs = externalTask.AverageWaitTimeMs;
            IsComplite = false;
            Device = device;
        }
    }
}