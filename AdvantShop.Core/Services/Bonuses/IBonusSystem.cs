using AdvantShop.Customers;

namespace AdvantShop.Core.Services.Bonuses
{
    /// <summary>
    /// Интерфейс для реализации бонусной системы
    /// </summary>
    public interface IBonusSystem
    {
        /// <summary>
        /// Активность бонусной системы
        /// </summary>
        bool IsActive { get; }
        
        /// <summary>
        /// Получение суммы бонусов, которыми можно оплатить покупку
        /// </summary>
        /// <param name="purchase">Покупка</param>
        /// <param name="customer">Покупатель оформляющий покупку</param>
        /// <returns>Кол-во бонусов для списания</returns>
        float GetApplyBonuses(IPurchase purchase, Customer customer);
        
        /// <summary>
        /// Получение суммы бонусов, которые будут начислены за покупку
        /// </summary>
        /// <param name="purchase">Покупка</param>
        /// <param name="customer">Покупатель оформляющий покупку</param>
        /// <returns>Кол-во бонусов для начисления</returns>
        float GetAccrueBonuses(IPurchase purchase, Customer customer);
        
        /// <summary>
        /// Получение суммы бонусов, которые планируются к начислению или уже начислено за указанную покупку
        /// </summary>
        /// <param name="purchaseNumber">Номер/идентификатор покупки<br />
        /// Для <see cref="AdvantShop.Orders.Order"/> это поле <see cref="AdvantShop.Orders.Order.Number"/><br />
        /// </param>
        /// <returns>
        /// Кол-во бонусов планируемое к начислению или уже начисленное.
        /// <remarks>
        /// AccrueBonuses - кол-во бонусов, IsAccrued - уже начислено или нет (null - не известно) 
        /// </remarks>
        /// </returns>
        (float? AccrueBonuses, bool? IsAccrued) GetAccrueBonuses(string purchaseNumber);
        
        /// <summary>
        /// Событие оформления покупки
        /// </summary>
        /// <param name="purchase">Покупка</param>
        /// <param name="customer">Покупатель оформивший покупку</param>
        /// <remarks>
        /// При вызове данного метода должны быть списаны бонусы за указанную покупку.
        /// Вызывается только один раз.
        /// </remarks>
        void OnPurchase(IPurchase purchase, Customer customer);
        
        /// <summary>
        /// Событие изменения покупки
        /// </summary>
        /// <param name="purchase">Измененная покупка</param>
        /// <remarks>
        /// Вызывается каждый раз при изменении данных покупки.<br />
        /// Например, когда была изменена/добавлена позиция.<br />
        /// Необходимо списать/вернуть бонусы в зависимости от увеличившегося/уменьшившегося <see cref="IPurchase.UsedBonuses">purchase.UsedBonuses</see>,
        /// а также пересчитать начисляемые бонусы.
        /// </remarks>
        void OnChangePurchase(IPurchase purchase);
        
        /// <summary>
        /// Подтверждение покупки
        /// </summary>
        /// <param name="purchase">Покупка</param>
        /// <returns>Покупка подтверждена и бонусы за покупку начислены.</returns>
        /// <remarks>
        /// Вызывается, когда покупка оплачена покупателем.<br />
        /// Необходимо начислить бонусы за покупку.<br />
        /// Финализирует продажу, однако не гарантируется, что после этого не будет вызван <see cref="OnChangePurchase"/>
        /// </remarks>
        bool ConfirmPurchase(IPurchase purchase);
        
        /// <summary>
        /// Отмена подтверждения покупки
        /// </summary>
        /// <param name="purchase">Покупка</param>
        /// <returns>Подтверждение покупки отменено и начисленные бонусы за покупку списаны.</returns>
        /// <remarks>
        /// Вызывается, когда оплата возвращается покупателю.<br />
        /// Необходимо списать начисленные бонусы.
        /// </remarks>
        bool UnConfirmPurchase(IPurchase purchase);
        
        /// <summary>
        /// Отмена покупки
        /// </summary>
        /// <param name="purchase">Отмененная покупка</param>
        /// <returns>Покупка отменена и отменены операции начисления и списания бонусов.</returns>
        /// <remarks>
        /// Вызывается при полной отмене покупки.<br />
        /// Необходимо вернуть бонусы списанные за покупку, а также списать начисленные за покупку бонусы.<br />
        /// После никакие методы по покупке не вызываются, только метод <see cref="RestorePurchase"/> реанимирующий покупку.
        /// </remarks>
        bool RollbackPurchase(IPurchase purchase);
        
        /// <summary>
        /// Возобновление покупки
        /// </summary>
        /// <param name="purchase">Возобновляемая покупка</param>
        /// <returns>Покупка восстановлена и примененные бонусы списаны.</returns>
        /// <remarks>
        /// Вызывается при возобновлении ранее отмененной покупки (метод <see cref="RollbackPurchase"/>).<br />
        /// При вызове данного метода должны быть списаны бонусы за указанную покупку.<br />
        /// Если покупка находится в оплаченном статусе дополнительно будет вызван метод <see cref="ConfirmPurchase"/>.
        /// </remarks>
        bool RestorePurchase(IPurchase purchase);
         
        /// <summary>
        /// Проверка возможности изменения бонусов для оплаты в указанной покупке.
        /// </summary>
        /// <param name="purchaseNumber">Номер/идентификатор покупки<br />
        /// Для <see cref="AdvantShop.Orders.Order"/> это поле <see cref="AdvantShop.Orders.Order.Number"/><br />
        /// </param>
        /// <returns>
        /// <see cref="true"/> если можно изменять кол-во бонусов для оплаты заказа, в противном случае - <see cref="false"/>.
        /// </returns>
        bool CanChangeApplyBonuses(string purchaseNumber);
        
        /// <summary>
        /// Событие удаления покупки
        /// </summary>
        /// <param name="purchase">Покупка</param>
        /// <remarks>
        /// Вызывается при удалении покупки.<br />
        /// Предполагается поведение как <see cref="RollbackPurchase"/>, но не обязательно.
        /// </remarks>
        void OnDeletePurchase(IPurchase purchase);
    }
}