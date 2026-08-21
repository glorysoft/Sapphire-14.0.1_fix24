using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Shipping.Rules
{
    public class IncreaseCostEditor: IEditor
    {
        protected readonly float IncreasePercents;
        protected readonly float IncreaseCost;
        protected readonly float RateCurrency;

        public IncreaseCostEditor(float increasePercents, float increaseCost, float rateCurrency)
        {
            IncreasePercents = increasePercents;
            IncreaseCost = increaseCost;
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
            
            var costByObjectCurrency = CurrencyService.ConvertCurrency(IncreaseCost, obj.Currency.Rate, RateCurrency);
            var newCost = obj.Cost.Value
                          + costByObjectCurrency
                          + (IncreasePercents * obj.Cost.Value / 100);
            newCost = newCost >= 0f ? newCost : 0f;
            
            obj.ChangeCost(newCost);
        }
    }
}