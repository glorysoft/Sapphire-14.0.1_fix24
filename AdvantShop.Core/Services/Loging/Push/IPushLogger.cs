using System;
using System.Collections.Generic;

namespace AdvantShop.Core.Services.Loging.Push
{
    public interface IPushLogger : IAdvantShopLogger
    {
        void LogPush(PushLog push);
        void UpdatePushLogStatus(Guid customerId, Guid messageId, PushStatus status);

        List<PushLog> GetPushLogs(Guid customerId);
    }
}