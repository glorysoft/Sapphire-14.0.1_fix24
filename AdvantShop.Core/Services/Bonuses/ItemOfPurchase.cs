namespace AdvantShop.Core.Services.Bonuses
{
    public class ItemOfPurchase : IItem
    {
        public string Code { get; set; }
        public float Price { get; set; }
        public float BasePrice { get; set; }
        public float Amount { get; set; }
        public bool ApplyDiscounts { get; set; }
        public bool AccrueBonuses { get; set; }
    }
}