namespace AdvantShop.Core.Services.Bonuses
{
    /// <summary>
    /// Бонусная карта
    /// </summary>
    public sealed class Card
    {
        /// <summary>
        /// Бонусная карта
        /// </summary>
        public Card(string number)
        {
            Number = number;
        }

        /// <summary>
        /// Номер
        /// </summary>
        public string Number { get; private set; }
        
        /// <summary>
        /// Кол-во бонусов
        /// </summary>
        public float? Bonuses { get; set; }
    }
}