using AdvantShop.Web.Infrastructure.Admin;

namespace AdvantShop.Web.Admin.Models.Settings.ShippingRules
{
    public class RulesFilterResult : FilterResult<RuleGridModel> { }
    
    public class RuleGridModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Enabled { get; set; }
        public int SortOrder { get; set; }
    }
}