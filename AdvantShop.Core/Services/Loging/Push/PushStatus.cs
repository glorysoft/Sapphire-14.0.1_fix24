using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Core.Services.Loging.Push
{
    public enum PushStatus
    {
        [Localize("Core.Services.PushStatus.Sent")]
        Sent = 0,
        
        [Localize("Core.Services.PushStatus.Delivered")]
        Delivered = 1,
        
        [Localize("Core.Services.PushStatus.Opened")]
        Opened = 2,
        
        [Localize("Core.Services.PushStatus.Failed")]
        Failed = 3,
    }
}