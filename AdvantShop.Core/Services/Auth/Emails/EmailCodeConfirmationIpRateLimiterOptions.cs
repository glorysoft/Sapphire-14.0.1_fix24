namespace AdvantShop.Core.Services.Auth.Emails
{
    public class EmailCodeConfirmationIpRateLimiterOptions
    {
        /// <summary>
        /// Максимальное кол-во проверок за минуту
        /// </summary>
        public const int MaxMinuteCount = 3;

        /// <summary>
        /// На сколько минут будет заблокированы проверки за 1 минуту при превышении лимита в MaxMinuteCount
        /// </summary>
        public const int BlockedMinutesFor1Minute = 10;
        
        /// <summary>
        /// Максимальное кол-во проверок за 10 минут
        /// </summary>
        public const int MaxTenMinutesCount = 5;

        /// <summary>
        /// На сколько минут будет заблокированы проверки за 10 минут при превышении лимита в MaxTenMinutesCount
        /// </summary>
        public const int BlockedMinutesFor10Minute = 30;
    }
}