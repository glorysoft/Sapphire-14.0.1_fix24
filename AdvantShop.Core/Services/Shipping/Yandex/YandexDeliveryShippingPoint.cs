namespace AdvantShop.Shipping.Yandex
{
    public class YandexDeliveryShippingPoint : BaseShippingPoint
    {
        /// <summary>
        /// Почта России
        /// </summary>
        public bool IsPostOffice { get; set; }
        /// <summary>
        /// Признак партнерского ПВЗ
        /// </summary>
        public bool IsMarketPartner { get; set; }
        /// <summary>
        /// Признак брендированные ли ПВЗ
        /// </summary>
        public bool IsYandexBranded { get; set; }
        /// <summary>
        /// Признак даркстора
        /// </summary>
        public bool IsDarkStore { get; set; }
        /// <summary>
        /// Разрешена ли примерка на ПВЗ
        /// </summary>
        public bool IsFittingAllowed { get; set; }
        /// <summary>
        /// Разрешена ли сдача без бумаг на ПВЗ
        /// </summary>
        public bool IsPartialRefuseAllowed { get; set; }
        /// <summary>
        /// Разрешен ли частичный выкуп на ПВЗ
        /// </summary>
        public bool IsPaperlessPickupAllowed { get; set; }
        /// <summary>
        /// Разрешено ли вскрытие транспортной упаковки
        /// </summary>
        public bool IsUnboxingAllowed { get; set; }
    }
}
