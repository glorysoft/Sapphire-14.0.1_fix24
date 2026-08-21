using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AdvantShop.Configuration;
using AdvantShop.Diagnostics;

namespace AdvantShop.Core.Services.Loging.Push
{
    public class ActivityPushLogger : IPushLogger
    {
        private string ActivityPushLogBaseUrl => LinkService.Internal.ActivityPushLogService + "/";

        public void LogPush(PushLog pushLog) =>
            Task.Run(() =>
                new ActivityRequest(ActivityPushLogBaseUrl).Post("api/v1/log", new PushLogCreateDto(pushLog)));

        public void UpdatePushLogStatus(Guid customerId, Guid messageId, PushStatus status) =>
            Task.Run(() =>
                new ActivityRequest(ActivityPushLogBaseUrl).Post("api/v1/log/status",
                    new PushLogUpdateDto(customerId, messageId, status)));

        public List<PushLog> GetPushLogs(Guid customerId)
        {
            try
            {
                return new ActivityRequest(ActivityPushLogBaseUrl)
                    .Get<List<PushLogReadDto>>($"api/v1/log/?customerId={customerId}")
                    ?.Select(dto => dto.ToModel())
                    .ToList();
            }
            catch (Exception exception)
            {
                Debug.Log.Error($"Failed to fetch push notifications for user {customerId}", exception);
            }
            return null;
        }
    }
}