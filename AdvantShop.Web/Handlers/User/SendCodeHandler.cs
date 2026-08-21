using System;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.Helpers;
using AdvantShop.Models.User;
using AdvantShop.ViewModel.Auth;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class SendCodeHandler : AbstractCommandHandler<SendCodeResponse>
    {
        private readonly SendCodeModel _model;

        private string _phoneStr;
        private long _phone;
        private readonly IPhoneConfirmationService _phoneConfirmationService;
        private readonly bool _withCaptcha;
        
        public SendCodeHandler(SendCodeModel model, bool withCaptcha = true)
        {
            _model = model;
            _phoneConfirmationService = new PhoneConfirmationService();
            _withCaptcha = withCaptcha;
        }

        protected override void Validate()
        {
            if(_withCaptcha)
                AuthCaptchaHandler.Validate(_model);
            
            if (!SettingsAuth.AuthByCodeActive)
                throw new BlException(LocalizationService.GetResource("User.SendCode.AuthByCodeActiveError"));
            
            if (string.IsNullOrEmpty(_model.Phone))
                throw new BlException(LocalizationService.GetResource("User.SendCode.PhoneError"));
            
            _phoneStr = StringHelper.HtmlEncode(_model.Phone);

            _phone = StringHelper.ConvertToStandardPhone(_phoneStr) ?? 0;
            if (_phone == 0)
                throw new BlException("Введите корректный номер телефона");

            if (!_model.SignUp) // если авторизация, то проверяем, что пользователь существует
            {
                var customer = CustomerService.GetCustomerByPhone(_phoneStr, _phone);
                if (customer == null)
                    throw new BlException(
                        LocalizationService.GetResourceFormat("User.SendCode.CustomerError", _phoneStr)
                    );
            }
            
            var result = _phoneConfirmationService.IsModuleActive();
            if (!result.IsSuccess)
                throw new BlException(result.Error.Message);
        }

        protected override SendCodeResponse Handle()
        {
            try
            {
                _phoneConfirmationService.SendCode(_phone, null);
            }
            catch (BlException)
            {
                ConfirmCodeHandler.IncreaseErrorCount(_phone, _phoneConfirmationService);
                throw;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                throw new BlException(LocalizationService.GetResource("User.SendCode.SendError"));
            }
            
            return new SendCodeResponse {SecondsToRetry = PhoneConfirmationConfig.SecondsPerPhoneBetweenMessage};
        }
    }
}