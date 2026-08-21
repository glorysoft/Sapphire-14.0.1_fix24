using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Shipping.Rules
{
    public class ReduceCostByItemsTotalPriceEditor: IEditor
    {
        protected readonly float ReducePercents;

        public ReduceCostByItemsTotalPriceEditor(float reducePercents)
        {
            ReducePercents = reducePercents;
        }

        public void Change(IObjectForRule obj)
        {
            if (obj.Currency is null
                || obj.CalculationParameters?.Currency is null)
                // не знаем контекста валют
                return;
            
            if (obj.Cost is null)
                // нечего увеличивать
                return;
            
            var totalPriceByObjectCurrency =
                CurrencyService.ConvertCurrency(
                    obj.CalculationParameters.ItemsTotalPriceWithDiscounts, 
                    newCurrencyValue: obj.Currency.Rate, 
                    oldCurrencyValue: obj.CalculationParameters.Currency.Rate);
            
            var newCost = obj.Cost.Value
                          - (ReducePercents * totalPriceByObjectCurrency / 100);
            newCost = newCost >= 0f ? newCost : 0f;
            
            obj.ChangeCost(newCost);
        }
    }
}