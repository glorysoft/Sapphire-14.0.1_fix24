using System.Collections.Generic;
using System.Linq;
using System.Web;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Diagnostics;
using Newtonsoft.Json;

namespace AdvantShop.MobileApp
{
    // docs: https://developers.google.com/recaptcha/docs/v3?hl=ru
    
    public sealed class MobileAppCaptchaService
    {
        public bool VerifyCaptcha(string token, string action)
        {
            var result = RequestHelper.MakeRequest<MobileAppVerifyCaptchaResponse>(
                "https://www.google.com/recaptcha/api/siteverify",
                $"secret={HttpUtility.UrlEncode(SettingsApiAuth.ReCaptchaV3SecretKey)}&response={HttpUtility.UrlEncode(token)}",
                null,
                ERequestMethod.POST,
                ERequestContentType.FormUrlencoded);

            if (!result.Success)
            {
                var errorCodes = result.ErrorCodes?.Select(GetLocalizedErrorCode).ToList();
                var errorCodesStr = errorCodes != null ? string.Join(",", errorCodes) : "";
                
                Debug.Log.Warn($"MobileApp captcha error: {errorCodesStr}; token: {token} secret_token: {SettingsApiAuth.ReCaptchaV3SecretKey} error_codes: {string.Join(", ", result.ErrorCodes ?? new List<string>())}");
            }
            else
            {
                if (result.Score < 0.5)
                    Debug.Log.Warn($"MobileApp captcha error: score < 0.5; score: {result.Score}");
                
                if (result.Action != action)
                    Debug.Log.Warn($"MobileApp captcha error: action != {action}; response_action: {result.Action}");
            }
            
            return result.Success
                   && result.Score >= 0.5 
                   && result.Action == action;
        }

        private string GetLocalizedErrorCode(string errorCode)
        {
            switch (errorCode)
            {
                case "missing-input-secret":
                    return "Секретный параметр отсутствует";
                
                case "invalid-input-secret":
                    return "Секретный параметр недействителен или имеет неправильный формат";
                
                case "missing-input-response":
                    return "Параметр ответа отсутствует";
                
                case "invalid-input-response":
                    return "Параметр ответа недействителен или имеет неправильный форма";
                
                case "bad-request":
                    return "Запрос недействителен или имеет неверный формат";
                
                case "timeout-or-duplicate":
                    return "Ответ больше недействителен: либо он слишком старый, либо использовался ранее";
            }
            
            return errorCode;
        }
    }

    public sealed class MobileAppVerifyCaptchaResponse
    {
        /// <summary>
        /// whether this request was a valid reCAPTCHA token for your site
        /// </summary>
        [JsonProperty("success")]
        public bool Success { get; set; }

        /// <summary>
        /// the score for this request (0.0 - 1.0)
        /// </summary>
        [JsonProperty("score")]
        public double Score { get; set; }

        /// <summary>
        /// the action name for this request (important to verify)
        /// </summary>
        [JsonProperty("action")]
        public string Action { get; set; }

        [JsonProperty("error-codes")] 
        public List<string> ErrorCodes { get; set; }
    }
}