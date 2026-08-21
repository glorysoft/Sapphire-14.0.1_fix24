using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Models.User;
using AdvantShop.Security;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class ConfirmCodeHandler : AbstractCommandHandler
    {
        private readonly ConfirmCodeModel _model;
        private readonly IPhoneConfirmationService _phoneCodeConfirmationService;
        
        private long _phone;
        
        public const string WrongConfirmCount = "login_auth_count";
        
        public ConfirmCodeHandler(ConfirmCodeModel model)
        {
            _model = model;
            _phoneCodeConfirmationService = new PhoneConfirmationService();
        }

        protected override void Validate()
        {
            AuthCaptchaHandler.Validate(_model);
            
            if (!SettingsAuth.AuthByCodeActive)
                throw new BlException(LocalizationService.GetResource("User.ConfirmCode.AuthByCodeActiveError"));
            
            _phone = StringHelper.ConvertToStandardPhone(_model.Phone) ?? 0;
            if (_phone == 0)
                throw new BlException(LocalizationService.GetResource("User.ConfirmCode.PhoneError"));
            
            if (!_model.SignUp)  // если авторизация, то проверяем, что пользователь существует
            {
                var customer = CustomerService.GetCustomerByPhone(_model.Phone, _phone);
                if (customer == null)
                {
                    IncreaseErrorCount(_phone);
                    throw new BlException(LocalizationService.GetResourceFormat("User.ConfirmCode.PhoneError", _model.Phone));
                }
            }

            if (string.IsNullOrWhiteSpace(_model.Code))
            {
                IncreaseErrorCount(_phone);
                throw new BlException(LocalizationService.GetResource("User.ConfirmCode.CodeError"));
            }
            
            if (_phoneCodeConfirmationService.IsBannedByPhoneOrIp(_phone, HttpContext.Current.TryGetIp()))
                throw new BlException(LocalizationService.GetResource("User.ConfirmCode.TooManyError"));
        }

        protected override void Handle()
        {
            try
            {
                _phoneCodeConfirmationService.ConfirmPhoneByCode(_phone, _model.Code);
                
                HttpContext.Current.Session[WrongConfirmCount] = null;

                if (!_model.SignUp)
                {
                    AuthByPhone();
                    return;
                }
                
                _phoneCodeConfirmationService.SetPhoneConfirmedState(_phone, CustomerContext.CustomerId);
            }
            catch (BlException)
            {
                IncreaseErrorCount(_phone);
                throw;
            }
        }

        private void AuthByPhone()
        {
            var customersByPhone = CustomerService.GetCustomersByPhone(_model.Phone);
            if (customersByPhone.Count > 1)
                customersByPhone = customersByPhone
                    .OrderByDescending(x => CustomerService.GetCustomerLastOrderDate(x.Id))
                    .ThenByDescending(x => x.RegistrationDateTime)
                    .ToList();

            var customer = customersByPhone.FirstOrDefault();

            if (customer == null)
                return;

            if (customer.Password.IsNullOrEmpty())
            {
                var password = StringHelper.GeneratePassword(8);
                customer.Password = SecurityHelper.GetPasswordHash(password);
                CustomerService.UpdateCustomerPassword(customer.Id, customer.Password);
            }

            AuthorizeService.SignInByPhone(customer.StandardPhone, customer.Password, true, true);
            AuthCaptchaHandler.ClearAttempts();
        }

        private void IncreaseErrorCount(long phone)
        {
            IncreaseErrorCount(phone, _phoneCodeConfirmationService);
        }

        public static void IncreaseErrorCount(long phone, IPhoneConfirmationService phoneConfirmationService)
        {
            var count = Convert.ToInt32(HttpContext.Current.Session[WrongConfirmCount]) + 1;
            HttpContext.Current.Session[WrongConfirmCount] = count;

            if (count > 15)
            {
                phoneConfirmationService.Ban(phone, HttpContext.Current.TryGetIp(), DateTime.Now.AddHours(1));
                
                HttpContext.Current.Session[WrongConfirmCount] = null;
            }
        }
    }
}