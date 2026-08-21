namespace AdvantShop.Core.Services.Shipping.Rules
{
    public class RuleDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Enabled { get; set; }
        public int SortOrder { get; set; }
        public string EditorsParams { get; set; }
        public string FiltersParams { get; set; }
    }
}