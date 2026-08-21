using System;
using System.Collections.Generic;
using AdvantShop.MobileApp;

namespace AdvantShop.Core.Services.Loging.Push
{
    public class PushLogCreateDto
    {
        public Guid CustomerId { get; }
        public Guid MessageId { get; }
        public string Title { get; }
        public string Body { get; }
        public string ModuleName { get; }
        public Dictionary<string, string> Parameters { get; }
        public string Status { get; set; }
        public DateTime CreatedOnUtc { get; }
        public NotificationSource Source { get; }

        public PushLogCreateDto(PushLog pushLog)
        {
            CustomerId = pushLog.CustomerId;
            MessageId = pushLog.MessageId;
            Title = pushLog.Title;
            Body = pushLog.Body;
            ModuleName = pushLog.ModuleName;
            Parameters = pushLog.Parameters;
            Status = pushLog.Status.ToString();
            Source = pushLog.Source;
            CreatedOnUtc = DateTime.UtcNow;
        }
    }
}