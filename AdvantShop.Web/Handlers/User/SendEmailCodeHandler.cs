using System;
using AdvantShop.Core;
using AdvantShop.Core.Services.Auth.Emails;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.Models.User;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class SendEmailCodeHandler : ICommandHandler
    {
        private readonly SendEmailCodeModel _model;
        private readonly bool _withCaptcha;

        public SendEmailCodeHandler(SendEmailCodeModel model, bool withCaptcha = true)
        {
            _model = model;
            _withCaptcha = withCaptcha;
        }

        public void Execute()
        {
            if(_withCaptcha)
                AuthCaptchaHandler.Validate(_model);
            
            if (string.IsNullOrWhiteSpace(_model.Email))
                throw new BlException(LocalizationService.GetResource("User.SendEmailCode.EmptyEmailError"));
            
            if (_model.Authorize)
            {
                var customer = CustomerService.GetCustomerByEmail(_model.Email);
                if (customer == null)
                    throw new BlException(LocalizationService.GetResource("User.SendEmailCode.EmptyCustomerError"));
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
                throw new BlException(LocalizationService.GetResource("User.SendEmailCode.SendEmailError"));
            }
        }
    }
}