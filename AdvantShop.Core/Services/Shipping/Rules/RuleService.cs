using System;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Shipping.Rules
{
    public class RuleService
    {
        public const string ActionsAndFilersSeparator = "$$";
        public const string ParametersSeparator = ";";

        public static Rule CreateRuleByDto(RuleDto ruleDto)
        {
            ruleDto = ruleDto ?? throw new ArgumentNullException(nameof(ruleDto));
            
            var filters = ruleDto.FiltersParams.IsNotEmpty()
                ? ruleDto.FiltersParams.Split(new []{ActionsAndFilersSeparator}, StringSplitOptions.RemoveEmptyEntries)
                         .Select(filterStr =>
                          {
                              IFilter filter = null; 
                              var parameters = filterStr.Split(ParametersSeparator);
                              switch (parameters[0])
                              {
                                  case "allShipping":
                                      break;
                                  case "byType":
                                  case "excludeByType":
                                      filter = new FilterByType(
                                          parameters[1].Split(new[] {','}, StringSplitOptions.RemoveEmptyEntries),
                                          filterIsPositive: parameters[0].Equals("byType"));
                                      break;
                                  case "byId":
                                  case "excludeById":
                                      filter =  new FilterById(
                                          parameters[1].Split(new[] {','}, StringSplitOptions.RemoveEmptyEntries)
                                                       .Select(x => x.TryParseInt()),
                                          filterIsPositive: parameters[0].Equals("byId"));
                                      break;
                                  case "filterTotalPrice":
                                      filter = new FilterByRangeItemsTotalPrice(
                                          parameters[2].TryParseFloat(true),
                                          parameters[3].TryParseFloat(true),
                                          CurrencyService.GetCurrency(parameters[4].TryParseInt())?.Rate ?? 1f,
                                          filterIsPositive: true);
                                      break;
                                  case "filterCost":
                                      filter = new FilterByRangeCost(
                                          parameters[2].TryParseFloat(true),
                                          parameters[3].TryParseFloat(true),
                                          CurrencyService.GetCurrency(parameters[4].TryParseInt())?.Rate ?? 1f,
                                          filterIsPositive: true);
                                      break;
                                  case "filterWeight":
                                      filter = new FilterByRangeWeight(
                                          parameters[2].TryParseFloat(true),
                                          parameters[3].TryParseFloat(true),
                                          filterIsPositive: true);
                                      break;
                              }

                              return filter;
                          })
                         .Where(x => x != null)
                         .ToArray()
                : Array.Empty<IFilter>();

            var editors = ruleDto.EditorsParams.IsNotEmpty()
                ? ruleDto.EditorsParams.Split(new[] {ActionsAndFilersSeparator}, StringSplitOptions.RemoveEmptyEntries)
                         .Select(editorStr =>
                          {
                              IEditor editor = null;
                              var parameters = editorStr.Split(new[] {ParametersSeparator}, StringSplitOptions.RemoveEmptyEntries);
                              switch (parameters[0])
                              {
                                  case "fixedCost":
                                      editor = new FixedCostEditor(
                                          parameters[1].TryParseFloat(),
                                          CurrencyService.GetCurrency(parameters[2].TryParseInt())?.Rate ?? 1f);
                                      break;
                                  case "switchOff":
                                      editor = new SwitchOffEditor();
                                      break;
                                  case "increaseCost":
                                      editor = new IncreaseCostEditor(
                                          increasePercents: parameters[1].TryParseFloat(),
                                          increaseCost: parameters[2].TryParseFloat(),
                                          CurrencyService.GetCurrency(parameters[3].TryParseInt())?.Rate ?? 1f);
                                      break;
                                  case "reduceCost":
                                      editor = new ReduceCostEditor(
                                          reducePercents: parameters[1].TryParseFloat(),
                                          reduceCost: parameters[2].TryParseFloat(),
                                          CurrencyService.GetCurrency(parameters[3].TryParseInt())?.Rate ?? 1f);
                                      break;
                                  case "increaseCostByOrderSum":
                                      editor = new IncreaseCostByItemsTotalPriceEditor(
                                          increasePercents: parameters[1].TryParseFloat());
                                      break;
                                  case "reduceCostByOrderSum":
                                      editor = new ReduceCostByItemsTotalPriceEditor(
                                          reducePercents: parameters[1].TryParseFloat());
                                      break;
                              }

                              return editor;
                          })
                         .Where(x => x != null)
                         .ToArray()
                : Array.Empty<IEditor>();
                

            return new Rule(filters, editors);
        }
    }
}