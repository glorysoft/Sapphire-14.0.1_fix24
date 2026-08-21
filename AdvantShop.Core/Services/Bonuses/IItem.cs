namespace AdvantShop.Core.Services.Bonuses
{
    public interface IItem
    {
        /// <summary>
        /// Код/Артикул/Номер/Идентификатор
        /// </summary>
        string Code { get; }
        
        /// <summary>
        /// Цена
        /// </summary>
        float Price { get; }
        
        /// <summary>
        /// Цена без скидок
        /// </summary>
        float BasePrice { get; }
        
        /// <summary>
        /// Количество
        /// </summary>
        float Amount { get; }
        
        /// <summary>
        /// Разрешено применение скидок
        /// </summary>
        bool ApplyDiscounts { get; }
        
        /// <summary>
        /// Разрешено начисление бонусов
        /// </summary>
        bool AccrueBonuses { get; }
    }
}