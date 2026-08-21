using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Web.Admin.Models.Settings.ShippingRules;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.ShippingRules
{
    public class GetRule: ICommandHandler<RuleModel>
    {
        private readonly int _id;

        public GetRule(int id)
        {
            _id = id;
        }

        public RuleModel Execute()
        {
            var ruleDto = RuleRepository.Get(_id);
            if (ruleDto is null)
                throw new BlException(LocalizationService.GetResource("Admin.ShippingRules.RuleNotFound"));

            return new RuleModel
            {
                Id = ruleDto.Id,
                Name = ruleDto.Name,
                Enabled = ruleDto.Enabled,
                SortOrder = ruleDto.SortOrder,
                EditorsParams = ruleDto.EditorsParams,
                FiltersParams = ruleDto.FiltersParams,
            };
        }
    }
}