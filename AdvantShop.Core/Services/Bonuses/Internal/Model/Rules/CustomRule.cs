using AdvantShop.Core.Services.Bonuses.Internal.Model.Enums;

namespace AdvantShop.Core.Services.Bonuses.Internal.Model.Rules
{
    public class CustomRule
    {
        public ERule RuleType { get; set; }
        public bool Enabled { get; set; }
        public string Name { get; set; }
        public string Params { get; set; }
    }
}
