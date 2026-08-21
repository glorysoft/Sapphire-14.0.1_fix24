namespace AdvantShop.Core.Services.Auth.Emails
{
    internal class EmailConfirmationOptions
    {
        public const int MinutesToClear = 5;

        /// <summary>
        /// Время жизни кода в минутах
        /// </summary>
        public const int TTLMinutes = 10;
        
        /// <summary>
        /// Максимальное кол-во попыток 
        /// </summary>
        public const int MaxAttempts = 5;
        
        /// <summary>
        /// Сколько живет счетчик попыток в минутах (за 10 минут можно 5 проверок)
        /// </summary>
        public const int AttemptsWindowMinutes = 10;

        /// <summary>
        /// На сколько минут будет заблокирована проверка, если кол-во проверок превысит MaxAttempts
        /// </summary>
        public const int BlockMinutes = 30;
    }
}