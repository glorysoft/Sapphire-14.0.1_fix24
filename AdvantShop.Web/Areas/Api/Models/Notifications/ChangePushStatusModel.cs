using System;

namespace AdvantShop.Areas.Api.Models.Notifications
{
    public sealed class ChangePushStatusModel
    {
        public string Status { get; set; }
        public Guid CustomerId { get; set; }
    }

    public enum PushStatusState
    {
        Delivered,
        Opened
    }
}