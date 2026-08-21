using System;
using System.Web;
using AdvantShop.Areas.Api.Models;
using AdvantShop.Areas.Api.Models.Users;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Auth.Emails;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.Helpers;
using AdvantShop.MobileApp;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Users
{
    public sealed class SignInByEmailApi : AbstractCommandHandler<SignInByEmailResponse>
    {
        private readonly SignInByEmailModel _model;
        private string _email;
        private Customer _customer;

        public SignInByEmailApi(SignInByEmailModel model)
        {
            _model = model;
        }
        
        protected override void Validate()
        {
            if (SettingsAuth.EmailAuthType != EEmailAuthType.Code)
                throw new BlException(T("Api.Users.SignInByEmailApi.EmailByCodeIsProhibited"));
            
            _email = _model.Email;

            if (_email.IsNullOrEmpty() || !ValidationHelper.IsValidEmail(_email))
                throw new BlException(T("Api.Users.SignInByEmailApi.WrongEmail"));
            
            if (SettingsMain.RegistrationIsProhibited)
            {
                _customer = CustomerService.GetCustomerByEmail(_email);
                if (_customer == null)
                    throw new BlException(T("User.Registration.ErrorRegistrationIsProhibited"));
            }
            
            if (new EmailCodeConfirmationIpRateLimiter().IsBlocked(HttpContext.Current.TryGetIp()))
                throw new BlException(T("Api.Users.SignInByEmailApi.TooManyRequests"));

            if (SettingsApiAuth.IsReCaptchaV3Enabled)
            {
                if (_model.CaptchaToken.IsNullOrEmpty())
                    throw new BlException("Проверка с помощью капчи не была пройдена, повторите попытку");
                
                if (!new MobileAppCaptchaService().VerifyCaptcha(_model.CaptchaToken, "login"))
                    throw new BlException("Проверка с помощью капчи не была пройдена, повторите попытку");
            }
            
            var (ipBytes, ip) = HttpContext.Current.TryGetIpBytes();
            if (ipBytes != null)
            {
                if (!MobileAppRequestHistoryService.IsExists(ipBytes))
                    throw new BlException("Не валидный запрос");
            }
        }

        protected override SignInByEmailResponse Handle()
        {
            if (SettingsApi.TestAccountCustomerId != null)
            {
                if (_customer == null)
                    _customer = CustomerService.GetCustomerByEmail(_email);
                
                if (_customer != null 
                    && _customer.Id == SettingsApi.TestAccountCustomerId.Value)
                {
                    return new SignInByEmailResponse() { IsCodeSended = true };
                }
            }
            
            try
            {
                EmailConfirmationService.SendCode(_model.Email);
            }
            catch (BlException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                throw new BlException(LocalizationService.GetResource("Api.Users.SignInByEmailApi.SendEmailError"));
            }
            
            return new SignInByEmailResponse() { IsCodeSended = true };
        }
    }
}