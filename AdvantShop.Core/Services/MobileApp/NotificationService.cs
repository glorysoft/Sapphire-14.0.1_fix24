using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Diagnostics;
using System;
using System.Collections.Generic;
using AdvantShop.Core.Services.Loging;
using AdvantShop.Core.Services.Loging.Push;

namespace AdvantShop.MobileApp
{
    public class NotificationService
    {
        /// <summary>
        /// Идентификатор в уведомления для логов и моб приложения
        /// </summary>
        public const string MessageId = "messageId";
        public const string CustomerId = "customerId";
        
        public static INotificationService GetActiveModule()
        {
            foreach (var moduleType in AttachedModules.GetModules<INotificationService>())
            {
                var module = (INotificationService)Activator.CreateInstance(moduleType, null);
                if (module != null)
                    return module;
            }

            return null;
        }

        public static string SendNotification(Notification notification)
        {
            if (notification.Title.IsNullOrEmpty() && notification.Body.IsNullOrEmpty())
                return "Не заполнен заголовок и тело уведомления";

            var (messageId, requestParams) = SetRequestParams(notification.RequestParams, notification.CustomerId);
            
            notification.RequestParams = requestParams;
            
            var status = PushStatus.Sent;
            string moduleName = null;
            
            try
            {
                var module = GetActiveModule();
                if (module == null)
                    return "Нет активных модулей для отправки Push уведомлений";

                moduleName = (module as IModule)?.ModuleName;
                var error = module.SendNotification(notification);

                status = string.IsNullOrWhiteSpace(error) ? PushStatus.Sent : PushStatus.Failed;

                return error;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                status = PushStatus.Failed;
                return ex.Message;
            }
            finally
            {
                LoggingManager.GetPushLogger().LogPush(
                    new PushLog
                    {
                        CustomerId = notification.CustomerId,
                        MessageId = messageId,
                        Title = notification.Title,
                        Body = notification.Body,
                        ModuleName = moduleName,
                        Parameters = notification.RequestParams,
                        Status = status,
                        Source = notification.Source,
                    });
            }
        }

        private static (Guid, Dictionary<string, string>) SetRequestParams(Dictionary<string, string> requestParams, Guid customerId)
        {
            if (requestParams == null)
                requestParams = new Dictionary<string, string>();

            var messageId = Guid.NewGuid();

            if (!requestParams.ContainsKey(MessageId))
            {
                requestParams.Add(MessageId, messageId.ToString());
            }
            else
            {
                var id = requestParams[MessageId].TryParseGuid(true);
                if (id == null || id == Guid.Empty)
                    requestParams[MessageId] = messageId.ToString();
                else
                    messageId = id.Value;
            }

            if (!requestParams.ContainsKey(CustomerId))
                requestParams[CustomerId] = customerId.ToString();
            
            return (messageId, requestParams);
        }
    }
}