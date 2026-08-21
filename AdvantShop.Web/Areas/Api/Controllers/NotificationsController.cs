using System;
using System.Web.Mvc;
using AdvantShop.Areas.Api.Attributes;
using AdvantShop.Areas.Api.Handlers.Notifications;
using AdvantShop.Areas.Api.Models.Notifications;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Areas.Api.Controllers
{
    [LogRequest, AntiInjection]
    public class NotificationsController : BaseApiController
    {
        // POST notifications/sendPush
        [HttpPost, AuthApiKey]
        public JsonResult SendPush(NotificationModel notification) => 
            JsonApi(new SendPush(notification));
        
        // POST notifications/{id}/changeStatus
        [HttpPost, AuthApiKey]
        public JsonResult ChangePushStatus(Guid id, ChangePushStatusModel model) => 
            JsonApi(new ChangePushStatus(id, model));
        
        // POST notifications/{id}/status
        [HttpPost, AuthApiKeyByUser, AuthUserApi]
        public JsonResult MeChangePushStatus(Guid id, ChangePushStatusModel model) => 
            JsonApi(new ChangePushStatus(id, model));
    }
}