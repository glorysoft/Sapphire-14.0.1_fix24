 using System;
 using AdvantShop.Areas.Api.Models.Notifications;
using AdvantShop.Core;
using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Loging;
using AdvantShop.Core.Services.Loging.Push;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Notifications
{
    public sealed class ChangePushStatus : AbstractCommandHandler<ApiResponse>
    {
        private readonly Guid _id;
        private readonly ChangePushStatusModel _model;
        private PushStatus _status;

        public ChangePushStatus(Guid id, ChangePushStatusModel model)
        {
            _id = id;
            _model = model;
        }
        
        protected override void Validate()
        {
            if (_model == null)
                throw new BlException("Неизвестный статус");
            
            if (!Enum.TryParse(_model.Status, true, out PushStatus status))
                throw new BlException("Неизвестный статус");
            
            if (status != PushStatus.Delivered 
                && status != PushStatus.Opened)
                throw new BlException("Неизвестный статус");

            _status = status;
        }
        
        
        protected override ApiResponse Handle()
        {
            LoggingManager.GetPushLogger().UpdatePushLogStatus(_model.CustomerId, _id, _status);

            return new ApiResponse();
        }
    }
}