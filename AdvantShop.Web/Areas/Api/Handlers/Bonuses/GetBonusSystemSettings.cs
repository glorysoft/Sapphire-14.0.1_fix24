using AdvantShop.Areas.Api.Models.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Bonuses
{
    public class GetBonusSystemSettings : AbstractCommandHandler<BonusSystemSettings>
    {
        public GetBonusSystemSettings()
        {
        }

        protected override void Validate()
        {
        }

        protected override BonusSystemSettings Handle()
        {
            var settings = new BonusSystemSettings()
            {
                IsEnabled = InternalBonusSystem.IsEnabled,
                BonusGradeId = InternalBonusSystem.DefaultGrade,
                CardNumberFrom = InternalBonusSystem.CardFrom,
                CardNumberTo = InternalBonusSystem.CardTo,
                MaxOrderPercent = InternalBonusSystem.MaxOrderPercent,
                BonusType = InternalBonusSystem.BonusType,
                BonusTextBlock = InternalBonusSystem.BonusTextBlock,
                BonusRightTextBlock = InternalBonusSystem.BonusRightTextBlock,
                DisallowUseWithCoupon = InternalBonusSystem.ForbidOnCoupon
            };

            foreach (var method in InternalBonusSystem.EnabledNotificationMethods)
                switch (method)
                {
                    case EBonusNotificationMethod.Sms:
                        settings.SmsNotificationEnabled = true;
                        break;
                    case EBonusNotificationMethod.Email:
                        settings.EmailNotificationEnabled = true;
                        break;
                    case EBonusNotificationMethod.Push:
                        settings.PushNotificationEnabled = true;
                        break;
                }

            var grade = settings.Grades.Find(x => x.Value == settings.BonusGradeId.ToString());
            if (grade != null)
                grade.Selected = true;

            var bonusType = settings.BonusTypes.Find(x => x.Value == settings.BonusType.ToString());
            if (bonusType != null)
                bonusType.Selected = true;

            return settings;
        }
    }
}