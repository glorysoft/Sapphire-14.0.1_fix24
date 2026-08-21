using System;
using System.Web;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Models.User;
using AdvantShop.Security;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class EmailLoginHandler : ICommandHandler<string>
    {
        private const string LoginJsonCaptchaCount = "login_json_count";
        
        private readonly EmailLoginModel _model;
        private readonly HttpSessionStateBase _session;

        public EmailLoginHandler(EmailLoginModel model, HttpSessionStateBase session)
        {
            _model = model;
            _session = session;
        }
        
        public string Execute()
        {
            AuthCaptchaHandler.Validate(_model);
            
            if (string.IsNullOrEmpty(_model.Email) 
                || string.IsNullOrEmpty(_model.Password))
                throw new BlException(LocalizationService.GetResource("User.EmailLogin.FieldsError"));
            
            if (AuthorizeService.IsTwoFactorAuth(_model.Email, _model.Password))
            {
                _session[LoginJsonCaptchaCount] = 0;
                
                var token = Guid.NewGuid();
                CacheManager.Insert(token.ToString(), (_model.Email, _model.Password));
                AuthCaptchaHandler.ClearAttempts();
                
                return UrlService.GetAdminUrl($"CodeAuth?token={token}");
            }
            
            if (!AuthorizeService.SignIn(_model.Email, _model.Password, false, true, out _))
                throw new BlException(LocalizationService.GetResource("User.EmailLogin.PasswordError"));
            
            AuthCaptchaHandler.ClearAttempts();
            return string.Empty;
        }
    }
}