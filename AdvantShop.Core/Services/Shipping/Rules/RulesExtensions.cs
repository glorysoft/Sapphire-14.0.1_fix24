namespace AdvantShop.Core.Services.Shipping.Rules
{
    public static class RulesExtensions
    {
        public static Rule CreateRuleByDto(this RuleDto ruleDto) 
            => RuleService.CreateRuleByDto(ruleDto);
    }
}