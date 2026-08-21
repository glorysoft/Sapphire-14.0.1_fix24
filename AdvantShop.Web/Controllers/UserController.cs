using AdvantShop.Configuration;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Customers;
using AdvantShop.Handlers.User;
using AdvantShop.Helpers;
using AdvantShop.Models.User;
using AdvantShop.Security;
using AdvantShop.Security.OAuth;
using AdvantShop.ViewModel.User;
using AdvantShop.Web.Infrastructure.Controllers;
using AdvantShop.Web.Infrastructure.Extensions;
using AdvantShop.Web.Infrastructure.Filters;
using System;
using System.Threading.Tasks;
using System.Web.Mvc;
using AdvantShop.Core;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Core.Services.Configuration.Settings.Enums;
using AdvantShop.Core.Services.Customers;
using AdvantShop.Core.Services.Diagnostics;

namespace AdvantShop.Controllers
{
    public sealed class UserController : BaseClientController
    {
        /// <summary>
        /// Эндпоинт для формирования дальнейших действий при авторизации. Необходимо для безопасности, чтобы явно
        /// не отвечать существует ли в системе пользователь с определенными данными.<br/><br/>
        /// Поддерживается только для входа через электронную почту или номер телефона.<br/><br/>
        /// Автоматически отправляет коды подтверждения.<br/><br/>
        /// </summary>
        /// <param name="model">Модель, которая содержит:<br/>
        /// Data — данные для обработки авторизации (номер телефона или адрес электронной почты).<br/>
        /// InputValue, CaptchaId, CaptchaInstanceId — данные капчи.</param>
        /// <returns>Стандартный CommandResult, где obj это строка состоящая из двух символов.<br/><br/>
        /// Первый символ обозначает, существует ли пользователь или нет и принимает значения:<br/>
        /// "y" — существует.<br/>
        /// "n" — не существует.<br/><br/>
        /// Второй символ обозначает текущий тип авторизации:<br/>
        /// "c" — подтверждение через код.<br/>
        /// "p" — подтверждение через пароль (доступно только для входа через email).</returns>
        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult AuthorizationData(AuthorizationDataModel model) =>
            ProcessJsonResult(new AuthorizationDataHandler(model));

        [HttpGet]
        public JsonResult IsNeedShowAuthCaptcha() =>
            JsonOk(AuthCaptchaHandler.NeedValidate());
        
        [HttpGet]
        public JsonResult IsNeedShowSendCodeCaptcha() => 
            JsonOk(SettingsMain.EnableCaptchaInSendCode || AuthCaptchaHandler.NeedValidate());
        
        #region Email Auth

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult EmailLogin(EmailLoginModel model) => 
            ProcessJsonResult(new EmailLoginHandler(model, Session));

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult SendEmailCode(SendEmailCodeModel model) =>
            ProcessJsonResult(new SendEmailCodeHandler(model));
        
        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult ConfirmEmailCode(ConfirmEmailCodeModel model) =>
            ProcessJsonResult(new ConfirmEmailCodeHandler(model));

        #endregion

        #region Code Auth
        
        [HttpGet]
        public JsonResult GetLoginCodeSettings() =>
            JsonOk(new GetLoginCodeSettingsHandler().Execute());

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult SendCode(SendCodeModel model) => 
            ProcessJsonResult(new SendCodeHandler(model));

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult ConfirmCode(ConfirmCodeModel model) =>
            ProcessJsonResult(new ConfirmCodeHandler(model));

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult IsPhoneConfirmed(string phone) =>
            ProcessJsonResult(new IsPhoneConfirmedHandler(phone));

        [HttpGet]
        public JsonResult InitCodeConfirmation() => 
            ProcessJsonResult(new InitCodeConfirmationHandler());

        #endregion
        
        #region Routes
        
        [HttpGet]
        public JsonResult GetAuthMethod() => 
            JsonOk(SettingsAuth.AuthMethod.ToString().ToLower());
        
        [HttpGet]
        public JsonResult GetAuthModuleId() => 
            JsonOk(SettingsAuth.DefaultAuthModuleId);

        [HttpGet]
        public JsonResult GetAuthRoutes() => 
            JsonOk(new AuthRoutesHandler().Execute());
        
        #endregion
        
        #region OAuth

        public ActionResult OpenId(string redirectTo) =>
            PartialView(new OpenIdHandler(redirectTo).Execute());

        public ActionResult LoginOpenId(string code, string state) =>
            Redirect(new LoginOpenIdHandler(code, state).Execute());

        public ActionResult LoginVk(string pageToRedirect) => 
            Redirect(VkOAuth.OpenDialog(pageToRedirect));

        public ActionResult LoginFacebook(string pageToRedirect) =>
            Redirect(FacebookOAuth.OpenDialog(pageToRedirect));

        public ActionResult LoginGoogle(string pageToRedirect) =>
            Redirect(GoogleOAuth.OpenDialog(pageToRedirect));

        public ActionResult LoginGoogleAnalytics(string pageToRedirect) =>
            Redirect(GoogleOAuth.OpenAnalyticsDialog(pageToRedirect));

        public ActionResult LoginOk(string pageToRedirect) => 
            Redirect(OkOAuth.OpenDialog(pageToRedirect));

        public ActionResult LoginMailRu(string pageToRedirect) => 
            Redirect(MailOAuth.OpenDialog(pageToRedirect));

        public ActionResult LoginYandex(string pageToRedirect) => 
            Redirect(YandexOAuth.OpenDialog(pageToRedirect));

        public ActionResult LoginOAuth(string provider, string pageToRedirect)
        {
            var returUrl = string.IsNullOrEmpty(pageToRedirect) ? this.Url.Action("LoginExternal", "User", null, this.Request.Url.Scheme) : pageToRedirect;
            return string.IsNullOrWhiteSpace(provider)
                ? Redirect(PassportAdvantService.GetLoginPage(returUrl, SettingsLic.LicKey))
                : Redirect(PassportAdvantService.GetLoginRequest(returUrl, provider, SettingsLic.LicKey));
        }

        public async Task<ActionResult> LoginExternal(string code, string state)
        {
            if (string.IsNullOrEmpty(state)) throw new Exception("state missing");
            var data = state.Split('|');
            if (data.Length != 3) throw new Exception("state missing");
            var provider = data[0];
            var pageToRedirect = data[1];
            var advClientId = data[2];

            pageToRedirect = pageToRedirect.TrimStart('/').ToLower();

            await PassportAdvantService.Login(code, state);

            return Redirect(pageToRedirect);
        }

        #endregion

        #region Registration

        [HttpGet]
        public JsonResult InitRegistration() =>
            JsonOk(new InitRegistrationHandler().Execute());
        
        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult Registration(RegistrationModel model, ERegistrationMethod method) => 
            CustomerContext.CurrentCustomer.RegistredUser
                ? JsonOk()
                : ProcessJsonResult(new RegistrationHandler(model, method, TempData));

        #endregion

        #region Recovery password
        
        public ActionResult RecoveryPassword(string email, string recoveryCode, int? lpId)
        {
            try
            {
                var model = new RecoveryPasswordHandler(email, recoveryCode, lpId).Execute();
                
                SetMetaInformation(T("User.ForgotPassword.PasswordRecovery"));
                SetNoFollowNoIndex();
                SetNgController(NgControllers.NgControllersTypes.RecoveryPasswordCtrl);
                
                return lpId != null 
                    ? View("~/Views/User/RecoveryPassword.cshtml", model) 
                    : View(model);
            }
            catch (BlException)
            {
                return RedirectToRoute("Home");
            }
        }
        
        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult SendRecoveryPassword(string email, int? lpId) =>
            ProcessJsonResult(new SendRecoveryPasswordHandler(email, lpId));

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult ChangePassword(string newPassword, string newPasswordConfirm, string email, string recoveryCode) => 
            ProcessJsonResult(new ChangePasswordHandler(newPassword, newPasswordConfirm, email, recoveryCode, Session));

        #endregion

        #region ClientCode

        [ChildActionOnly]
        public ActionResult ClientCode()
        {
            if (BrowsersHelper.IsBot())
                return new EmptyResult();
            
            if (!SettingsDesign.ShowClientId)
                // стили по ClientCode необходимо включить в CriticalCss
                if (!DebugMode.IsDebugMode(eDebugMode.CriticalCss)) 
                    return new EmptyResult();

            return PartialView(new ClientCodeViewModel());
        }

        public JsonResult GetClientCode()
        {
            if (BrowsersHelper.IsBot())
                return JsonOk();
            
            if (!SettingsDesign.ShowClientId)
                // стили по ClientCode необходимо включить в CriticalCss
                if (!DebugMode.IsDebugMode(eDebugMode.CriticalCss)) 
                    return JsonOk();
            
            var code = ClientCodeService.GetClientCode(CustomerContext.CustomerId);

            return JsonOk(new ClientCodeViewModel()
            {
                Code = code.ToString("##,##0").Replace(",", "-").Replace("\u00A0", "-")
            });
        }

        #endregion

        #region Phone confirmation

        [HttpGet]
        public JsonResult InitPhoneConfirmation() =>
            JsonOk(new InitPhoneConfirmationHandler().Execute());

        #endregion

        public ActionResult Login(string from, string state, string code)
        {
            if (!string.IsNullOrWhiteSpace(state))
            {
                if (state.Contains("googleanalytics"))
                {
                    GoogleOAuth.LoginAnalytics(code, "login");
                    return RedirectToRoute("Home", new { state = "googleanalytics" });
                }
                
                return RedirectToRoute("LoginOpenId", new { state, code });
            }

            if (CustomerContext.CurrentCustomer.CustomerRole != Role.Guest)
            {
                if (string.IsNullOrWhiteSpace(from))
                    return RedirectToRoute("Home");

                return Redirect(from);
            }

            if (string.IsNullOrWhiteSpace(from))
                from = Url.RouteUrl("Home");
            
            SetMetaInformation(T("User.Login.Header"));
            return View("Login", "_UserLayout", from);
        }
        
        [TechDomainGuard(Disable = true)]
        public ActionResult LoginToken(string email, string hash, string redirectTo, bool? showhelp)
        {
            SettingsLic.ShowAdvantshopJivoSiteForm = showhelp ?? false;
            var customer = CustomerService.GetCustomerByEmail(email);
            if (customer != null)
            {
                var hashComputed = SecurityHelper.EncodeWithHmac(customer.EMail, customer.Password);
                if (hash == hashComputed && AuthorizeService.SignIn(customer.EMail, customer.Password, true, true))
                {
                    var domain = UrlService.GetAbsoluteBaseLink();
                    
                    if (!string.IsNullOrEmpty(redirectTo) && redirectTo != "/")
                        return Redirect(
                            Uri.IsWellFormedUriString(redirectTo, UriKind.Absolute)
                                ? redirectTo
                                : Url.AbsoluteActionUrl("RedirectWithAuth", "Account", new
                                    {
                                        area = "AdminV2",
                                        domain = domain,
                                        path = redirectTo,
                                    })
                        );

                    if (!string.IsNullOrEmpty(SettingsMain.AdminHomeForceRedirectUrl))
                        return Redirect(
                            Uri.IsWellFormedUriString(SettingsMain.AdminHomeForceRedirectUrl, UriKind.Absolute)
                                ? SettingsMain.AdminHomeForceRedirectUrl
                                : Url.AbsoluteActionUrl("RedirectWithAuth", "Acc", new
                                {
                                    area = "AdminV2",
                                    domain = domain,
                                    path = SettingsMain.AdminHomeForceRedirectUrl,
                                })
                        );

                    if (string.IsNullOrEmpty(redirectTo))
                        return Redirect(Url.AbsoluteActionUrl("RedirectWithAuth", "Account", new
                        {
                            area = "AdminV2",
                            domain = domain,
                            path = "/adminv2",
                        }));
                }
            }

            return Redirect("~/");
        }
        
        [AdminMobileAppGuard(Disable = true)]
        public ActionResult Logout()
        {
            AuthorizeService.SignOut();

            if (MobileHelper.IsMobileAdminApp())
            {
                CustomerAdminPushNotificationService.UpdateFcmToken(CustomerContext.CustomerId, null);
                RedirectToAction("Login", "Account", new { area = "AdminV2" });
            }

            if (Request.GetUrlReferrer() != null)
            {
                var referrer = Request.GetUrlReferrer().ToString();

                if (!string.IsNullOrEmpty(referrer) && !(referrer.Contains("admin") 
                                                         || referrer.Contains("checkout") 
                                                         || referrer.Contains("advantshop.net")))
                    return Redirect(referrer);
            }

            return RedirectToRoute("Home");
        }
        
        public ActionResult RegistrationCustomerFields(
            string ngModelName,
            string cssParamName,
            string cssParamValue,
            bool checkFields,
            string ngVariableVisible
        ) => PartialView(
            "_CustomerFields", 
            new RegistrationCustomerFieldsHandler(
                ngModelName,
                cssParamName,
                cssParamValue,
                checkFields,
                ngVariableVisible
             ).Execute());

        [ChildActionOnly]
        public ActionResult CloseTrigger()
        {
            if (SettingsMain.StoreAccessMode != EStoreAccessMode.All)
                return new EmptyResult();
            
            var from = Request.QueryString["from"];

            if (string.IsNullOrWhiteSpace(from))
                from = Url.RouteUrl("Home");
            
            if (from.Equals(Url.RouteUrl("Checkout"), StringComparison.OrdinalIgnoreCase))
                from = Url.RouteUrl("Cart");
                
            return PartialView("CloseTrigger", from);
        }
    }
}