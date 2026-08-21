using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Shipping.Rules
{
    [DifficultyOfFilter(ECostFilter.Easy)]
    public class FilterByRangeCost: BaseFilterBiLogic
    {
        protected readonly float? From;
        protected readonly float? To;
        protected readonly float RateCurrency;

        public FilterByRangeCost(float? from, float? to, float rateCurrency, bool filterIsPositive): base(filterIsPositive)
        {
            From = from;
            To = to;
            RateCurrency = rateCurrency;
        }

        public override bool Check(IObjectForRule obj)
        {
            if (obj.Currency is null)
                // не знаем в контексте каких валют необходимо сравнивать
                return false;
            
            if (obj.Cost is null)
                // сравнивать не с чем
                return false;

            if (From is null
                && To is null)
                return true;

            var fromCostByObjectCurrency =
                From != null
                    ? CurrencyService.ConvertCurrency(From.Value, obj.Currency.Rate, RateCurrency)
                    : (float?)null;
            var toCostByObjectCurrency =
                To != null
                    ? CurrencyService.ConvertCurrency(To.Value, obj.Currency.Rate, RateCurrency)
                    : (float?)null;
            var result = (fromCostByObjectCurrency is null || obj.Cost >= fromCostByObjectCurrency)
                         && (toCostByObjectCurrency is null || obj.Cost <= toCostByObjectCurrency);
            
            return FilterIsPositive ? result : !result;
        }
    }
}