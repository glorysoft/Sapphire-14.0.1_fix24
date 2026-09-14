using System;
using System.Web.Mvc;
using AdvantShop.Web.Infrastructure.Controllers;
using AdvantShop.Module.SmsConfirmation.Models;
using AdvantShop.Module.SmsConfirmation.Service;
using Newtonsoft.Json;
using AdvantShop.Core.Services.Smses;

namespace AdvantShop.Module.SmsConfirmation.Controllers
{
    public class SmsConfirmationAdminController : ModuleAdminController
    {
        #region PROMO Feedback

        public ActionResult Feedback()
        {
            return PartialView("~/modules/" + SmsConfirmation.ModuleStringId + "/Views/Admin/_Feedback.cshtml", JsonConvert.SerializeObject(new FeedbackModel(Customers.CustomerContext.CurrentCustomer)));
        }

        [HttpPost]
        public JsonResult Feedback(FeedbackModel feedback)
        {
            if (string.IsNullOrEmpty(feedback.Message))
            {
                return Json(new { success = false, msg = "Заполните поле 'Сообщение'" });
            }

            try
            {
                Core.Modules.ModulesService.SendModuleMail(Guid.Empty, "Обратная связь. " + SmsConfirmation.ModuleName, GenerateHtmlMessage(feedback), Service.SmsConfirmationSettings.PromoHelpEmail, true);
                return Json(new { success = true, msg = "Сообщение отправлено" });
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { success = false, msg = "Ошибка при отправке сообщения. см. лог ошибок" });
            }
        }

        private string GenerateHtmlMessage(FeedbackModel feedback)
        {
            var mailBody = "<b>Сообщение:</b><br />" + feedback.Message + "<br /><br />";
            mailBody += string.Format("<b>URL магазина:</b> {0}<br/> <b>ФИО:</b> {1}<br/> <b>Почта администратора:</b> {2}<br/> <b>Телефон:</b> {3}",
                Configuration.SettingsMain.SiteUrl,
                feedback.Name,
                feedback.Email,
                feedback.Phone);
            return mailBody;
        }

        #endregion

        #region banners data
        public ActionResult GetPromoContentBannersData()
        {
            var bannersData = SmsConfirmationService.GetPromoContentBannersData();
            if (!bannersData.BannersSettingsActive || (string.IsNullOrEmpty(bannersData.FirstBannerImage) && string.IsNullOrEmpty(bannersData.SecondBannerImage) && string.IsNullOrEmpty(bannersData.ThirdBannerImage)))
                return new EmptyResult();

            bannersData.Host = SmsConfirmationSettings.CrmPromoUrl + "/";

            return PartialView("~/modules/" + SmsConfirmation.ModuleStringId + "/Views/Admin/_BannersData.cshtml", bannersData);
        }

        #endregion

        #region module settings
        public ActionResult ModuleSettings()
        {
            return PartialView("~/modules/" + SmsConfirmation.ModuleStringId + "/Views/Admin/_ModuleSettings.cshtml");
        }

        [HttpGet]
        public JsonResult GetSettings()
        {
            string activeModule = null;
            string activeModuleLink = null;

            var activeSmsModule = SmsNotifier.GetActiveSmsModule();
            if (activeSmsModule != null)
            {
                activeModule = activeSmsModule.ModuleName;
                activeModuleLink = "modules/details/" + activeSmsModule.ModuleStringId;
            }

            var settings = new SettingsModel
            {
                RegistrationPageActive = SmsConfirmationSettings.RegistrationPageActive,
                AuthorizationPageActive = SmsConfirmationSettings.AuthorizationPageActive,
                CheckoutPageActive = SmsConfirmationSettings.CheckoutPageActive,
                FormContent = SmsConfirmationSettings.FormContent,
                FormTitle = SmsConfirmationSettings.FormTitle,
                UseCaptcha = SmsConfirmationSettings.UseCaptcha,
                ActiveModule = activeModule,
                ActiveModuleLink = activeModuleLink,
            };

            return Json(settings);
        }

        [HttpPost]
        public JsonResult SaveSettings(SettingsModel settings)
        {
            try
            {
                SmsConfirmationSettings.RegistrationPageActive = settings.RegistrationPageActive;
                SmsConfirmationSettings.AuthorizationPageActive = settings.AuthorizationPageActive;
                SmsConfirmationSettings.CheckoutPageActive = settings.CheckoutPageActive;
                SmsConfirmationSettings.FormContent = settings.FormContent ?? string.Empty;
                SmsConfirmationSettings.FormTitle = settings.FormTitle ?? string.Empty;
                SmsConfirmationSettings.UseCaptcha = settings.UseCaptcha;

                return Json(true);
            }
            catch(Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(false);
            }
        }

        #endregion
    }
}
