using System.Collections.Generic;
using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Bonuses
{
    public interface IPurchase
    {
        /// <summary>
        /// Номер/идентификатор
        /// </summary>
        /// <remarks>
        /// Для <see cref="AdvantShop.Orders.Order"/> это поле <see cref="AdvantShop.Orders.Order.Number"/><br />
        /// Для корзины это поле будет пустым
        /// </remarks>
        string Number { get; }
        
        /// <summary>
        /// Стоимость доставки
        /// </summary>
        float ShippingCost { get; }
        
        /// <summary>
        /// Использовано бонусов для оплаты продажи
        /// </summary>
        /// <remarks>
        /// null - покупатель не выбирал кол-во бонусов для списания
        /// </remarks>
        float? UsedBonuses { get; }
        
        /// <summary>
        /// Код примененного купона
        /// </summary>
        string CouponCode { get; }
        
        /// <summary>
        /// Валюта продажи
        /// </summary>
        Currency Currency { get; }
        
        /// <summary>
        /// Комментарий описывающий продажу
        /// </summary>
        string Comment { get; }
        
        IReadOnlyList<IItem> Items { get; }
    }
}