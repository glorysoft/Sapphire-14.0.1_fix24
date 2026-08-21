using System;

namespace AdvantShop.Core.Services.Loging.Push
{
    public class PushLogUpdateDto
    {
        public Guid CustomerId { get; }
        public Guid MessageId { get; }
        public PushStatus Status { get; }

        public PushLogUpdateDto(Guid customerId, Guid messageId, PushStatus status)
        {
            CustomerId = customerId;
            MessageId = messageId;
            Status = status;
        }
    }
}