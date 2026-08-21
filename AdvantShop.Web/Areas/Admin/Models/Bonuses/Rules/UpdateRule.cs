using AdvantShop.Core.Services.Bonuses.Internal.Model.Rules;
using AdvantShop.Core.Services.Bonuses.Internal.Service;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Models.Bonuses.Rules
{
    public class UpdateRule : AbstractCommandHandler<bool>
    {
        private RuleModel model;

        public UpdateRule(RuleModel model)
        {
            this.model = model;
        }

        protected override void Load()
        {
        }

        protected override void Validate()
        {
        }

        protected override bool Handle()
        {
            var b = new CustomRule
            {
                RuleType = model.RuleType,
                Enabled = model.Enabled,
                Name = model.Name
            };
            b.Params = BaseRule.Set(model.ToBaseRule());
            CustomRuleService.Update(b);
            return true;
        }
    }
}
