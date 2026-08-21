using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Shipping.Rules
{
    [DifficultyOfFilter(ECostFilter.Easy)]
    public class FilterByRangeItemsTotalPrice: BaseFilterBiLogic
    {
        protected readonly float? From;
        protected readonly float? To;
        protected readonly float RateCurrency;

        public FilterByRangeItemsTotalPrice(float? from, float? to, float rateCurrency, bool filterIsPositive): base(filterIsPositive)
        {
            From = from;
            To = to;
            RateCurrency = rateCurrency;
        }
   
        public override bool Check(IObjectForRule obj)
        {
            if (obj.CalculationParameters?.Currency is null)
                // не знаем в контексте каких валют необходимо сравнивать
                return false;

            if (From is null
                && To is null)
                return true;

            var fromTotalPriceByCalculationParametersCurrency =
                From != null
                    ? CurrencyService.ConvertCurrency(From.Value, obj.CalculationParameters.Currency.Rate, RateCurrency)
                    : (float?)null;
            var toTotalPriceByCalculationParametersCurrency =
                To != null
                    ? CurrencyService.ConvertCurrency(To.Value, obj.CalculationParameters.Currency.Rate, RateCurrency)
                    : (float?)null;
            var result =
                (fromTotalPriceByCalculationParametersCurrency is null
                 || obj.CalculationParameters.ItemsTotalPriceWithDiscounts >= fromTotalPriceByCalculationParametersCurrency)
                && (toTotalPriceByCalculationParametersCurrency is null
                    || obj.CalculationParameters.ItemsTotalPriceWithDiscounts <= toTotalPriceByCalculationParametersCurrency);
            
            return FilterIsPositive ? result : !result;
        }
    }
}