using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Shipping.Rules
{
    public class ReduceCostEditor: IEditor
    {
        protected readonly float ReducePercents;
        protected readonly float ReduceCost;
        protected readonly float RateCurrency;

        public ReduceCostEditor(float reducePercents, float reduceCost, float rateCurrency)
        {
            ReducePercents = reducePercents;
            ReduceCost = reduceCost;
            RateCurrency = rateCurrency > 0f ? rateCurrency : 1f;
        }

        public void Change(IObjectForRule obj)
        {
            if (obj.Currency is null)
                // не знаем контекста валют
                return;
            
            if (obj.Cost is null)
                // нечего увеличивать
                return;
            
            var costByObjectCurrency = CurrencyService.ConvertCurrency(ReduceCost, obj.Currency.Rate, RateCurrency);
            var newCost = obj.Cost.Value
                          - costByObjectCurrency
                          - (ReducePercents * obj.Cost.Value / 100);
            newCost = newCost >= 0f ? newCost : 0f;
            
            obj.ChangeCost(newCost);
        }
    }
}