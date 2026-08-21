using System;
using System.Web;
using AdvantShop.Core;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Models.User;
using AdvantShop.Security;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class ChangePasswordHandler : ICommandHandler<ChangePasswordModel>
    {
        private const string LoginJsonCaptchaCount = "login_json_count";
        
        private readonly string _newPassword;
        private readonly string _newPasswordConfirm;
        private readonly string _email;
        private readonly string _recoveryCode;
        private readonly HttpSessionStateBase _session;
        
        private Customer _customer;
        private string _recoveryHash;

        private ChangePasswordModel _model = new ChangePasswordModel();

        public ChangePasswordHandler(
            string newPassword, 
            string newPasswordConfirm, 
            string email,
            string recoveryCode,
            HttpSessionStateBase session
        )
        {
            _newPassword = newPassword;
            _newPasswordConfirm = newPasswordConfirm;
            _email = email;
            _recoveryCode = recoveryCode;
            _session = session;
        }
        public ChangePasswordModel Execute()
        {
            Load();
            Validate();
            Process();
            return _model;
        }

        private void Load()
        {
            if (!string.IsNullOrEmpty(_email))
                _customer = CustomerService.GetCustomerByEmail(_email);
            
            if (!string.IsNullOrEmpty(_recoveryCode) && _customer != null)
                _recoveryHash = ValidationHelper.DeleteSigns(
                    SecurityHelper.GetPasswordHash(
                        !string.IsNullOrWhiteSpace(_customer.Password) 
                            ? _customer.Password 
                            : _customer.EMail));
        }

        private void Validate()
        {
            if (string.IsNullOrWhiteSpace(_newPassword)
                || string.IsNullOrWhiteSpace(_newPasswordConfirm)
                || !_newPassword.Equals(_newPasswordConfirm))
                throw new BlException(LocalizationService.GetResource("User.ChangePassword.PasswordDifferent"));
            
            if (_customer == null)
                throw new BlException(LocalizationService.GetResource("User.ChangePassword.Error"));
            
            if (!_recoveryHash.ToLower().Equals(_recoveryCode.ToLower()))
                throw new BlException(LocalizationService.GetResource("User.ChangePassword.Error"));
        }

        private void Process()
        {
            CustomerService.ChangePassword(_customer.Id, _newPassword, false);
            
            if (AuthorizeService.IsTwoFactorAuth(_email, _newPassword))
            {
                _session[LoginJsonCaptchaCount] = 0;
                
                var token = Guid.NewGuid();
                CacheManager.Insert(token.ToString(), (_email, _newPassword));

                _model.RedirectTo = UrlService.GetAdminUrl($"CodeAuth?token={token}");
            }
            
            AuthorizeService.SignIn(_email, _newPasswordConfirm, false, true);
        }
    }
}