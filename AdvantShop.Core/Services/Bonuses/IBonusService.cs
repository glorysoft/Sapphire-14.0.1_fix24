using AdvantShop.Customers;

namespace AdvantShop.Core.Services.Bonuses
{
    /// <summary>
    /// Дополнительный интерфейс для начисления и списания бонусов
    /// </summary>
    /// <remarks>
    /// Реализуется тем же объектом, который реализует интерфейс <see cref="IBonusSystem"/>.<br />
    /// Реализация опциональна.
    /// </remarks>
    public interface IBonusService
    {
        /// <summary>
        /// Начисление бонусов на карту покупателя
        /// </summary>
        /// <param name="customer">Покупатель, которому нужно начислить бонусы</param>
        /// <param name="bonuses">Кол-во бонусов</param>
        /// <param name="basis">Основание для начисления (опционально)</param>
        /// <returns>Бонусы начислены покупателю</returns>
        bool Add(Customer customer, float bonuses, string basis = null);
        
        /// <summary>
        /// Списание бонусов с карты покупателя
        /// </summary>
        /// <param name="customer">Покупатель, у которого нужно списать бонусы</param>
        /// <param name="bonuses">Кол-во бонусов</param>
        /// <param name="basis">Основание для списания (опционально)</param>
        /// <returns>Бонусы списаны с карты покупателя</returns>
        bool Remove(Customer customer, float bonuses, string basis = null);
    }
}