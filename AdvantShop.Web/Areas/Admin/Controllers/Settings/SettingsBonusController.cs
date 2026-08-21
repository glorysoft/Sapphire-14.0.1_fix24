using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using AdvantShop.Catalog;
using AdvantShop.Core.Controls;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.SalesChannels;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Attributes;
using AdvantShop.Web.Admin.Models.Settings;
using AdvantShop.Web.Infrastructure.Controllers;

namespace AdvantShop.Web.Admin.Controllers.Settings
{
    [Auth(RoleAction.BonusSystem)]
    [SaasFeature(Saas.ESaasProperty.BonusSystem)]
    [SalesChannel(ESalesChannelType.Bonus)]
    [BonusSystem("")]
    public class SettingsBonusController : BaseAdminController
    {
        public ActionResult Index()
        {
            var model = new BonusSettingsModel()
            {
                IsEnabled = InternalBonusSystem.IsEnabled,
                BonusGradeId = InternalBonusSystem.DefaultGrade,
                CardNumFrom = InternalBonusSystem.CardFrom,
                CardNumTo = InternalBonusSystem.CardTo,
                MaxOrderPercent = InternalBonusSystem.MaxOrderPercent,
                BonusType = InternalBonusSystem.BonusType,
                BonusTextBlock = InternalBonusSystem.BonusTextBlock,
                BonusRightTextBlock = InternalBonusSystem.BonusRightTextBlock,
                ForbidOnCoupon = InternalBonusSystem.ForbidOnCoupon,
                AllowSpecifyBonusAmount = InternalBonusSystem.AllowSpecifyBonusAmount,
                ProhibitAccrualAndSubstractBonuses = InternalBonusSystem.ProhibitAccrualAndSubstractBonuses,
                AdditionalNotification = InternalBonusSystem.AdditionalNotification,
                BringFriendIsEnabled = InternalBonusSystem.BringFriendIsEnabled,
                BringFriendCouponId = InternalBonusSystem.BringFriendCouponId,
                BringFriendConditions = InternalBonusSystem.BringFriendConditions
            };

            foreach(var method in InternalBonusSystem.EnabledNotificationMethods)
                switch (method)
                {
                    case EBonusNotificationMethod.Sms:
                        model.SmsNotificationEnabled = true;
                        break;
                    case EBonusNotificationMethod.Email:
                        model.EmailNotificationEnabled = true;
                        break;
                    case EBonusNotificationMethod.Push:
                        model.PushNotificationEnabled = true;
                        break;
                }

            var item = model.Grades.Find(x => x.Value == model.BonusGradeId.ToString());
            if (item != null)
                item.Selected = true;

            SetMetaInformation(T("Admin.Settings.Bonus.Title"));
            SetNgController(NgControllers.NgControllersTypes.SettingsBonusCtrl);

            return View(model);
        }

        [HttpPost, ValidateAntiForgeryToken]
        public ActionResult Index(BonusSettingsModel model)
        {
            if (!ModelState.IsValid)
            {
                ShowErrorMessages();
            }
            else
            {
                InternalBonusSystem.IsEnabled = model.IsEnabled;
                InternalBonusSystem.DefaultGrade = model.BonusGradeId;
                InternalBonusSystem.CardFrom = model.CardNumFrom;
                InternalBonusSystem.CardTo = model.CardNumTo;
                InternalBonusSystem.MaxOrderPercent = model.MaxOrderPercent;
                InternalBonusSystem.BonusType = model.BonusType;
                InternalBonusSystem.BonusTextBlock = model.BonusTextBlock;
                InternalBonusSystem.BonusRightTextBlock = model.BonusRightTextBlock;
                InternalBonusSystem.ForbidOnCoupon = model.ForbidOnCoupon;
                InternalBonusSystem.AllowSpecifyBonusAmount = model.AllowSpecifyBonusAmount;
                InternalBonusSystem.ProhibitAccrualAndSubstractBonuses = model.ProhibitAccrualAndSubstractBonuses;
                var notificationMethods = new List<EBonusNotificationMethod>();
                if (model.SmsNotificationEnabled)
                    notificationMethods.Add(EBonusNotificationMethod.Sms);
                if (model.EmailNotificationEnabled)
                    notificationMethods.Add(EBonusNotificationMethod.Email);
                if (model.PushNotificationEnabled)
                    notificationMethods.Add(EBonusNotificationMethod.Push);
                if (model.PushNotificationEnabled && !model.EmailNotificationEnabled && !model.SmsNotificationEnabled)
                {
                    InternalBonusSystem.AdditionalNotification = model.AdditionalNotification;
                }
                else
                {
                    InternalBonusSystem.AdditionalNotification = null;
                }
                InternalBonusSystem.EnabledNotificationMethods = notificationMethods;
                InternalBonusSystem.BringFriendIsEnabled = model.BringFriendIsEnabled;
                InternalBonusSystem.BringFriendCouponId = model.BringFriendCouponId;
                InternalBonusSystem.BringFriendConditions = model.BringFriendConditions;

                ShowMessage(NotifyType.Success, T("Admin.ChangesSuccessfullySaved"));
            }

            return Index();
        }
        
        public JsonResult GetSelectedCoupon(int couponId)
        {
            var selectedCoupon = CouponService.GetCoupon(couponId, false);
            return Json(selectedCoupon != null ? new { selectedCoupon.CouponID, selectedCoupon.Code } : null);
        }
        
        public JsonResult GetCouponList(string q = null, int page = 1, int count = 100)
        {
            return Json(CouponService.GetCouponsBySearch(count, page, q).Select(x => new { x.CouponID, x.Code }));
        }
    }
}
