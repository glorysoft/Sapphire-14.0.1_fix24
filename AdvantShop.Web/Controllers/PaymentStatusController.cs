using System.Web.Mvc;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Handlers.PaymentStatus;
using AdvantShop.Payment;
using AdvantShop.ViewModel.PaymentStatus;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Controllers
{
    [LandingLayout]
    public class PaymentStatusController : BaseClientController
    {
        [LogRequest]
        public ActionResult Success(int advPaymentId)
        {
            var result = "";

            var method = PaymentService.GetPaymentMethod(advPaymentId);

            if (method != null && (method.NotificationType & NotificationType.ReturnUrl) == NotificationType.ReturnUrl)
            {
                var response = method.ProcessResponse(System.Web.HttpContext.Current);
                
                if (string.IsNullOrWhiteSpace(response))
                    return RedirectToAction("Cancel");
                
                result = LocalizationService.GetResource("PaymentStatus.Success.Status") + response;
            }
            
            SetMetaInformation(T("PaymentStatus.Success.MetaTitle"));
            SetNoFollowNoIndex();

            var model = new PaymentStatusViewModel(result, SettingsDesign.IsEmptyLayout);
            
            return model.IsEmptyLayout 
                ? View("Success", "_LayoutEmpty", model) 
                : View(model);
        }

        [LogRequest]
        public void Notification()
        {
            // JWS отправляется с application/json сырым боди c# не переваривает с ошибкой `Invalid JSON primitive` - парсим сами
            if (!RouteData.Values.TryGetValue("advPaymentId", out var advPaymentIdObj)
                || !(advPaymentIdObj is string advPaymentIdString)
                || !int.TryParse(advPaymentIdString, out var advPaymentId)) return;
            
            var response = new ProcessNotificationHandler(advPaymentId).Execute();
            if (!string.IsNullOrWhiteSpace(response))
                Response.Write(response);
        }

        public ActionResult Fail()
        {
            SetMetaInformation(T("PaymentStatus.Fail.MetaTitle"));
            SetNoFollowNoIndex();

            var model = new PaymentStatusResponse(SettingsDesign.IsEmptyLayout);
            
            return model.IsEmptyLayout 
                ? View("Fail", "_LayoutEmpty", model) 
                : View(model);
        }

        public ActionResult Cancel()
        {
            SetMetaInformation(T("PaymentStatus.Cancel.MetaTitle"));
            SetNoFollowNoIndex();
            
            var model = new PaymentStatusResponse(SettingsDesign.IsEmptyLayout);
            
            return model.IsEmptyLayout 
                ? View("Cancel", "_LayoutEmpty", model) 
                : View(model);
        }
    }
}