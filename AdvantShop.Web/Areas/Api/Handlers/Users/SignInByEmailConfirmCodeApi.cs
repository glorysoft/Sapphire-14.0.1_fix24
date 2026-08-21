using System;
using System.Web;
using AdvantShop.Areas.Api.Models.Customers;
using AdvantShop.Areas.Api.Models.Users;
using AdvantShop.Areas.Api.Services;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Auth.Emails;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.Helpers;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Users
{
    public sealed class SignInByEmailConfirmCodeApi : AbstractCommandHandler<SignInResponse>
    {
        private readonly SignInByEmailConfirmCodeModel _model;

        public SignInByEmailConfirmCodeApi(SignInByEmailConfirmCodeModel model)
        {
            _model = model;
        }

        protected override void Validate()
        {
            if (SettingsMain.RegistrationIsProhibited && !CustomerService.IsEmailExist(_model.Email))
                throw new BlException(T("User.Registration.ErrorRegistrationIsProhibited"));
            
            if (SettingsAuth.EmailAuthType != EEmailAuthType.Code)
                throw new BlException(T("Api.Users.SignInByEmailApi.EmailByCodeIsProhibited"));
            
            if (string.IsNullOrWhiteSpace(_model.Code))
                throw new BlException(T("Api.Users.SignInByEmailApi.WrongCode"));
            
            if (_model.Email.IsNullOrEmpty() || !ValidationHelper.IsValidEmail(_model.Email))
                throw new BlException(T("Api.Users.SignInByEmailApi.WrongEmail"));

            if (new EmailCodeConfirmationIpRateLimiter().IsBlocked(HttpContext.Current.TryGetIp()))
                throw new BlException(T("Api.Users.SignInByEmailApi.TooManyRequests"));
        }

        protected override SignInResponse Handle()
        {
            var customer = CustomerService.GetCustomerByEmail(_model.Email);
            
            var isTestCustomer = 
                SettingsApi.TestAccountCustomerId != null 
                && customer != null 
                && customer.Id == SettingsApi.TestAccountCustomerId.Value 
                && SettingsApi.TestAccountSmsVerificationCode == _model.Code;

            if (!isTestCustomer)
            {
                var confirmResult = EmailConfirmationService.Confirm(_model.Email, _model.Code);
                if (!confirmResult.IsSuccess)
                    throw new BlException(confirmResult.Error.Message);

                if (customer == null)
                {
                    customer = new Customer(CustomerGroupService.DefaultCustomerGroup)
                    {
                        CustomerRole = Role.User,
                        EMail = _model.Email,
                        Password = StringHelper.GeneratePassword(8)
                    };
                    CustomerService.InsertNewCustomer(customer, processTriggers: false);

                    customer = customer.Id != Guid.Empty ? CustomerService.GetCustomer(customer.Id) : null;
                    
                    if (customer != null)
                        CustomerService.SetDelayedTriggersStart(customer.Id, true);

                    if (customer == null)
                    {
                        Debug.Log.Error($"SignInByEmailConfirmCodeApi не удалось зарегистрировать покупателя {_model.Email}");
                        throw new BlException($"Ошибка при регистрации {_model.Email}");
                    }
                }

                if (customer.RegistredUser && customer.Password.IsNullOrEmpty())
                {
                    var password = StringHelper.GeneratePassword(8);
                    customer.Password = SecurityHelper.GetPasswordHash(password);
                    
                    CustomerService.UpdateCustomerPassword(customer.Id, customer.Password);
                }
            }

            new ApiAuthorizeService().SignIn(customer, out string userKey, out string userId);

            return new SignInResponse()
            {
                UserKey = userKey,
                UserId = userId,
                Customer = new GetCustomerResponse(customer)
            };
        }
    }
}