using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Repository.Currencies;
using AdvantShop.Shipping;
using AdvantShop.Web.Admin.Models.Settings.ShippingRules;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.ShippingRules
{
    public class GetRuleFormData: ICommandHandler<RuleFormDataModel>
    {
        private readonly object _shippingTypes;

        public GetRuleFormData(object shippingTypes)
        {
            _shippingTypes = shippingTypes;
        }

        public RuleFormDataModel Execute()
        {
            var defaultCurrencyIso3 = SettingsCatalog.DefaultCurrencyIso3;
            return new RuleFormDataModel
            {
                ActionsAndFilersSeparator = RuleService.ActionsAndFilersSeparator,
                ParametersSeparator = RuleService.ParametersSeparator,
                ShippingTypes = _shippingTypes,
                ShippingMethods =
                    ShippingMethodService.GetAllShippingMethods()
                                         .Select(x =>
                                              (object) new
                                              {
                                                  value = x.ShippingMethodId,
                                                  label = x.Name,
                                              })
                                         .ToList(),
                Currencies = 
                    CurrencyService.GetAllCurrencies()
                                   .OrderByDescending(x => x.Iso3 == defaultCurrencyIso3)
                                   .Select(x =>
                                        (object) new
                                        {
                                            value = x.CurrencyId,
                                            label = x.Name,
                                        })
                                   .ToList(),
            };
        }
    }
}