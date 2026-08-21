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
    public sealed class ConfirmEmailCodeHandler : AbstractCommandHandler
    {
        private readonly ConfirmEmailCodeModel _model;
        
        private Customer _customer;
        
        public ConfirmEmailCodeHandler(ConfirmEmailCodeModel model)
        {
            _model = model;
        }

        protected override void Validate()
        {
            AuthCaptchaHandler.Validate(_model);
            
            if (string.IsNullOrWhiteSpace(_model.Email))
                throw new BlException(LocalizationService.GetResource("User.ConfirmEmailCode.EmailError"));
            
            if (string.IsNullOrWhiteSpace(_model.Code))
                throw new BlException(LocalizationService.GetResource("User.ConfirmEmailCode.CodeError"));
            
            if (_model.Authorize)
            {
                _customer = CustomerService.GetCustomerByEmail(_model.Email);
                if (_customer == null)
                    throw new BlException(LocalizationService.GetResource("User.ConfirmEmailCode.CustomerError"));
            }
        }

        protected override void Handle()
        {
            var confirmResult = EmailConfirmationService.Confirm(_model.Email, _model.Code);
            if (!confirmResult.IsSuccess)
                throw new BlException(confirmResult.Error.Message);

            if (_model.Authorize)
                Authorize();
        }

        private void Authorize()
        {
            if (string.IsNullOrWhiteSpace(_customer.Password))
            {
                var password = StringHelper.GeneratePassword(8);
                _customer.Password = SecurityHelper.GetPasswordHash(password);
                CustomerService.UpdateCustomerPassword(_customer.Id, _customer.Password);
            }

            AuthorizeService.SignIn(_customer.EMail, _customer.Password, true, true);
            AuthCaptchaHandler.ClearAttempts();
        }
    }
}