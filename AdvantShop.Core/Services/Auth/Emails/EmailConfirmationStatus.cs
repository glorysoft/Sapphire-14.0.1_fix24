namespace AdvantShop.Core.Services.Auth.Emails
{
    public enum EmailConfirmationStatus
    {
        /// <summary>
        /// Код успешно проверен
        /// </summary>
        OK,
        
        /// <summary>
        /// Ошибка. Код не прошел проверку
        /// </summary>
        INVALID,
        
        /// <summary>
        /// Заблокирован. Превышен лимит на проверки
        /// </summary>
        LOCKED,
        
        /// <summary>
        /// Время на проверку кода вышло
        /// </summary>
        EXPIRED
    }
}