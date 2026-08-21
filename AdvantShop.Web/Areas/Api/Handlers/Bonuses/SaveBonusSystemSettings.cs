using AdvantShop.Areas.Api.Models.Bonuses;
using AdvantShop.Core;
using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Web.Infrastructure.Handlers;
using System.Collections.Generic;

namespace AdvantShop.Areas.Api.Handlers.Bonuses
{
    public class SaveBonusSystemSettings : AbstractCommandHandler<ApiResponse>
    {
        private readonly BonusSystemSettings _model;

        public SaveBonusSystemSettings(BonusSystemSettings model)
        {
            _model = model;
        }

        protected override void Validate()
        {
            if (_model.CardNumberTo <= _model.CardNumberFrom)
                throw new BlException("Проверьте диапазон карт");

            if (_model.MaxOrderPercent < 0)
                _model.MaxOrderPercent = 0;

            if (_model.MaxOrderPercent > 100)
                _model.MaxOrderPercent = 100;
        }

        protected override ApiResponse Handle()
        {
            InternalBonusSystem.IsEnabled = _model.IsEnabled;
            InternalBonusSystem.DefaultGrade = _model.BonusGradeId;
            InternalBonusSystem.CardFrom = _model.CardNumberFrom;
            InternalBonusSystem.CardTo = _model.CardNumberTo;
            InternalBonusSystem.MaxOrderPercent = _model.MaxOrderPercent;
            InternalBonusSystem.BonusType = _model.BonusType;
            InternalBonusSystem.BonusTextBlock = _model.BonusTextBlock;
            InternalBonusSystem.BonusRightTextBlock = _model.BonusRightTextBlock;
            InternalBonusSystem.ForbidOnCoupon = _model.DisallowUseWithCoupon;
            var notificationMethods = new List<EBonusNotificationMethod>();
            if (_model.SmsNotificationEnabled)
                notificationMethods.Add(EBonusNotificationMethod.Sms);
            if (_model.EmailNotificationEnabled)
                notificationMethods.Add(EBonusNotificationMethod.Email);
            if (_model.PushNotificationEnabled)
                notificationMethods.Add(EBonusNotificationMethod.Push);
            InternalBonusSystem.EnabledNotificationMethods = notificationMethods;

            return new ApiResponse();
        }
    }
}