using AdvantShop.Customers;

namespace AdvantShop.Core.Services.Bonuses
{
    /// <summary>
    /// Дополнительный интерфейс для работы с картами бонусной
    /// </summary>
    /// <remarks>
    /// Реализуется тем же объектом, который реализует интерфейс <see cref="IBonusSystem"/>.<br />
    /// Реализация опциональна.
    /// </remarks>
    public interface ICardService
    {
        /// <summary>
        /// Получение бонусной карты покупателя
        /// </summary>
        /// <param name="customer">Покупатель</param>
        /// <returns>Бонусная карта</returns>
        Card Get(Customer customer);
        
        /// <summary>
        /// Получение бонусной карты
        /// </summary>
        /// <param name="number">Номер карты</param>
        /// <returns>Бонусная карта</returns>
        Card Get(string number);
        
        /// <summary>
        /// Создание бонусной карты покупателю
        /// </summary>
        /// <param name="customer">Покупатель, которому необходимо завести бонусную карту</param>
        /// <returns>Бонусная карта покупателя</returns>
        Card Create(Customer customer);

        /// <summary>
        /// Удаление бонусной карты у покупателя
        /// </summary>
        /// <param name="customer">Покупатель, которому необходимо удалить бонусную карту</param>
        /// <returns>Бонусная карта покупателя удалена</returns>
        bool Delete(Customer customer);
    }
}