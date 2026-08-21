using System;
using System.Web;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.Models.User;
using BotDetect.Web.Mvc;

namespace AdvantShop.Handlers.User
{
    public sealed class AuthCaptchaHandler
    {
        private const int MaxCountAttempts = 2;
        private const string CountAttemptsLoginSessionKey = "login_count_attempts";

        public static void ClearAttempts()
        {
            SetCountAttempts(0);
        }

        public static void Validate(AuthCaptchaModel model)
        {
            var needValidate = NeedValidate();
            AddAttempt();

            if (needValidate && !MvcCaptcha.Validate(model.CaptchaId, model.InputValue, model.CaptchaInstanceId))
                throw new BlException(LocalizationService.GetResource("User.AuthCaptcha.Error"));
        }
        
        public static bool NeedValidate()
        {
            return GetCountAttempts() > MaxCountAttempts;
        }
        
        private static void AddAttempt()
        {
            var countAttempts = GetCountAttempts();
            countAttempts++;
            SetCountAttempts(countAttempts);
        }

        private static int GetCountAttempts()
        {
            object sessionValue;

            try
            {
                sessionValue = HttpContext.Current.Session[CountAttemptsLoginSessionKey];
            }
            catch (Exception exception)
            {
                Debug.Log.Error(exception.Message, exception);
                throw;
            }
            
            return Convert.ToInt32(sessionValue);
        }

        private static void SetCountAttempts(int count)
        {
            HttpContext.Current.Session[CountAttemptsLoginSessionKey] = count;
        }
    }
}