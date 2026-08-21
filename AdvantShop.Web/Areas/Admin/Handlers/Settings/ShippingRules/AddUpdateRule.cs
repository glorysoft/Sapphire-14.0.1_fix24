using AdvantShop.Core;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Web.Admin.Models.Settings.ShippingRules;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.ShippingRules
{
    public class AddUpdateRule : ICommandHandler
    {
        private readonly RuleModel _model;

        public AddUpdateRule(RuleModel model)
        {
            _model = model;
        }

        public void Execute()
        {
            var ruleDto =
                _model.Id > 0
                    ? RuleRepository.Get(_model.Id) ?? throw new BlException("Правило не найдено")
                    : new RuleDto();
            
            ruleDto.Name = _model.Name;
            ruleDto.Enabled = _model.Enabled;
            ruleDto.SortOrder = _model.SortOrder;
            ruleDto.EditorsParams = _model.EditorsParams;
            ruleDto.FiltersParams = _model.FiltersParams;
            
            if (ruleDto.Id > 0)
                RuleRepository.Update(ruleDto);
            else
                RuleRepository.Add(ruleDto);
        }
    }
}