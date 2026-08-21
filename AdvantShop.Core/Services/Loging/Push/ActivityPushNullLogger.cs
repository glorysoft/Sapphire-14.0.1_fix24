using System;
using System.Collections.Generic;

namespace AdvantShop.Core.Services.Loging.Push
{
    public class ActivityPushNullLogger : IPushLogger
    {
        public void LogPush(PushLog push)
        {
        }

        public void UpdatePushLogStatus(Guid customerId, Guid messageId, PushStatus status)
        {
        }

        public List<PushLog> GetPushLogs(Guid customerId) => null;
    }
}