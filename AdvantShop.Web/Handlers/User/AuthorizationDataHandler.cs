using System;
using System.Net.Mail;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Auth.Emails;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Models.User;
using AdvantShop.Security;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class AuthorizationDataHandler : ICommandHandler<string>
    {
        private const string ExistCustomer = "y";
        private const string NotExistCustomer = "n";
        private const string ConfirmationType = "c";
        private const string PasswordType = "p";
        
        private const string AdminUsername = "admin";
        
        private readonly AuthorizationDataModel _model;
        private string _result = string.Empty;
        
        public AuthorizationDataHandler(AuthorizationDataModel model)
        {
            _model = model;
        }

        public string Execute()
        {
            AuthCaptchaHandler.Validate(_model);
            
            var email = TryGetEmailAddress(_model.Data);
            var phone = StringHelper.ConvertToStandardPhone(_model.Data);

            if (Secure.IsDebugAccount(_model.Data))
                _result += ExistCustomer + PasswordType;
            else if (_model.Data.Equals(AdminUsername, StringComparison.OrdinalIgnoreCase))
                ProcessAdmin();
            else if (email != null && email.Address.Equals(_model.Data, StringComparison.OrdinalIgnoreCase))
                ProcessEmail(_model.Data);
            else if (phone.HasValue)
                ProcessPhone(phone.Value, _model.Data);

            if (string.IsNullOrEmpty(_result) && _result.Length != 2)
                throw new BlException(LocalizationService.GetResource("User.AuthorizationData.Error"));

            return _result;
        }

        private void ProcessPhone(long phone, string unconvertedPhone)
        {
            var customer = CustomerService.GetCustomerByPhone(unconvertedPhone, phone);

            if (SettingsMain.RegistrationIsProhibited && customer == null)
                throw new BlException(LocalizationService.GetResource("User.IsExistPhone.FoundCustomerError"));
            
            new SendCodeHandler(
                new SendCodeModel
                {
                    Phone = unconvertedPhone,
                    SignUp = customer == null,
                },
                false
            ).Execute();

            _result += customer != null ? ExistCustomer : NotExistCustomer;
            _result += ConfirmationType;
        }

        private void ProcessEmail(string email)
        {
            var customer = CustomerService.GetCustomerByEmail(email);
            
            if (SettingsMain.RegistrationIsProhibited && customer == null)
                throw new BlException(LocalizationService.GetResource("User.IsExistEmail.FoundCustomerError"));
            
            var useConfirmation = SettingsMail.IsMailServiceEnabled 
                                  && (SettingsAuth.EmailAuthType == EEmailAuthType.Code
                                      || (customer == null && SettingsAuth.UseEmailConfirmation)
                                  );
            
            if (useConfirmation)
                new SendEmailCodeHandler(
                    new SendEmailCodeModel
                    {
                        Email = email,
                        Authorize = customer != null
                    },
                    false
                ).Execute();
            
            _result += customer != null ? ExistCustomer : NotExistCustomer;
            _result += useConfirmation ? ConfirmationType : PasswordType;
        }

        private void ProcessAdmin()
        {
            var customer = CustomerService.GetCustomerByEmail(AdminUsername);
            
            if (SettingsMain.RegistrationIsProhibited && customer == null)
                throw new BlException(LocalizationService.GetResource("User.IsExistEmail.FoundCustomerError"));
            
            _result += customer != null ? ExistCustomer : NotExistCustomer;
            _result += PasswordType;
        }

        private static MailAddress TryGetEmailAddress(string email)
        {
            try
            {
                return new MailAddress(email);
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}