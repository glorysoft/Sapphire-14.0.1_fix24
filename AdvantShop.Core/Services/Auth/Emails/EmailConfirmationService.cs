using System;
using System.Web;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Primitives;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Mails;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Mails;

namespace AdvantShop.Core.Services.Auth.Emails
{
    public static class EmailConfirmationService
    {
        private static string CookieName = "ect"; 
        
        private const int CodeLength = 4;
        private const string CodeChars = "0123456789";
        private const string ConfirmedCookieName = "customer_email";
        
        /// <summary>
        /// Выслать код подтверждения на электронную почту 
        /// </summary>
        /// <param name="email">Электронная почта на которую будет отправлен код</param>
        /// <returns>Отправленный код</returns>
        public static string SendCode(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new BlException("Email address can't be null or empty.");
            
            if (!SettingsMail.IsMailServiceEnabled)
                throw new BlException("Mail service is not enabled.");

            var code = GenerateCode();
            
            MailService.SendMailNow(
                CustomerContext.CustomerId, 
                email, 
                new ConfirmationMailTemplate(code));
            
            EmailConfirmationRepository.Add(email, code);
            
            return code;
        }

        /// <summary>
        /// Процесс подтверждения электронной почты
        /// </summary>
        /// <param name="email">Подтверждаемая электронная почта</param>
        /// <param name="code">Код подтверждения</param>
        /// <returns>Подтверждена ли почта и причина отказа</returns>
        public static Result Confirm(string email, string code)
        {
            var status = EmailConfirmationRepository.VerifyEmailCode(email, code);
            switch (status)
            {
                case EmailConfirmationStatus.OK:
                {
                    if (CustomerContext.CurrentCustomer != null)
                        SetConfirmedState(email, CustomerContext.CustomerId);
                    
                    return Result.Success();
                }
                
                case EmailConfirmationStatus.INVALID:
                    return Result.Failure(
                        new Error(LocalizationService.GetResource("Core.EmailConfirmationService.Confirm.CodeError")));

                case EmailConfirmationStatus.LOCKED:
                {
                    new EmailCodeConfirmationIpRateLimiter().BlockIp(HttpContext.Current.TryGetIp());

                    return Result.Failure(
                        new Error(LocalizationService.GetResource(
                            "Core.EmailConfirmationService.Confirm.CodeLockedError")));
                }
                
                case EmailConfirmationStatus.EXPIRED:
                    return Result.Failure(
                        new Error(LocalizationService.GetResource("Core.EmailConfirmationService.Confirm.CodeLifePeriodError")));
            }
            
            return Result.Failure(
                new Error(LocalizationService.GetResource("Core.EmailConfirmationService.Confirm.CodeError")));
        }

        /// <summary>
        /// Процесс проверки была ли подтверждена электронная почта
        /// </summary>
        /// <param name="email">Подтверждаемая электронная почта</param>
        /// <returns>Была ли подтверждена электронная почта</returns>
        public static bool IsConfirmed(string email, Guid customerId)
        {
            var cookieValue = CommonHelper.GetCookieString(ConfirmedCookieName);
            if (string.IsNullOrWhiteSpace(cookieValue))
                return false;
            
            var value = GetConfirmedCookieValue(email, customerId);

            return cookieValue == value;
        }
        
        /// <summary>
        /// Установка кук подтверждения почты
        /// </summary>
        /// <param name="email">Подтвержденная электронная почта</param>
        /// <param name="customerId">ID пользователя, кто подтвердил</param>
        private static void SetConfirmedState(string email, Guid customerId) =>
            CommonHelper.SetCookie(
                ConfirmedCookieName, 
                GetConfirmedCookieValue(email, customerId), 
                new TimeSpan(0, 0, 30, 0), 
                true
            );
        
        private static string GenerateCode()
        {
            var smsCode = string.Empty;
            var rnd = new Random();

            for (var i = 1; i <= CodeLength; i++)
            {
                smsCode += CodeChars[(int)(CodeChars.Length * rnd.NextDouble())];
            }

            return smsCode;
        }
        
        private static string GetConfirmedCookieValue(string email, Guid customerId) => 
            $"{customerId}{email}{SettingsLic.LicKey}".Md5(false);
    }
}