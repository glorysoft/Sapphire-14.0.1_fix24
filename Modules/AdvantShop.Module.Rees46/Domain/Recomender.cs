using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Module.Rees46.Domain
{
    /// <summary>
    /// Рекомендации
    /// </summary>
    public enum Recomender
    {
        /// <summary>
        /// Не выводить
        /// </summary>
        [StringName("Не выводить")]
        none,

        /// <summary>
        /// Вас это заинтересует
        /// </summary>
        [StringName("Вас это заинтересует")]
        interesting,

        /// <summary>
        /// С этим товаром покупают
        /// </summary>
        [StringName("С этим товаром покупают")]
        also_bought,

        /// <summary>
        /// Похожие товары
        /// </summary>
        [StringName("Похожие товары")]
        similar,

        /// <summary>
        /// Популярные товары
        /// </summary>
        [StringName("Популярные товары")]
        popular,

        /// <summary>
        /// Посмотрите также
        /// </summary>
        [StringName("Посмотрите также")]
        see_also,

        /// <summary>
        /// Вы недавно смотрели
        /// </summary>
        [StringName("Вы недавно смотрели")]
        recently_viewed,

        /// <summary>
        /// Прямо сейчас покупают
        /// </summary>
        [StringName("Прямо сейчас покупают")]
        buying_now,
    }
}
