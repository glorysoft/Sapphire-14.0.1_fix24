using System;
using System.Collections.Generic;

namespace AdvantShop.Core.Services.Loging.Push
{
    public class PushLogReadDto
    {
        public Guid CustomerId { get; }
        public Guid MessageId { get; }
        public string Title { get; }
        public string Body { get; }
        public string ModuleName { get; }
        public Dictionary<string, string> Parameters { get; }
        public string Status { get; }
        public DateTime CreatedOnUtc { get; }

        public PushLogReadDto(Guid customerId,
            Guid messageId,
            string title,
            string body,
            string moduleName,
            Dictionary<string, string> parameters,
            string status,
            DateTime createdOnUtc)
        {
            CustomerId = customerId;
            MessageId = messageId;
            Title = title;
            Body = body;
            ModuleName = moduleName;
            Parameters = parameters;
            Status = status;
            CreatedOnUtc = createdOnUtc;
        }

        public PushLog ToModel() => new PushLog
        {
            CustomerId = CustomerId,
            MessageId = MessageId,
            ModuleName = ModuleName,
            Title = Title,
            Body = Body,
            Parameters = Parameters,
            Status = Enum.TryParse(Status, true, out PushStatus status) ? status : PushStatus.Sent,
            CreateOn = CreatedOnUtc.ToLocalTime()
        };
    }
}