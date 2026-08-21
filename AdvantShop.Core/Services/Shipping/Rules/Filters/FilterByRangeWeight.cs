using System.Linq;

namespace AdvantShop.Core.Services.Shipping.Rules
{
    [DifficultyOfFilter(ECostFilter.Easy)]
    public class FilterByRangeWeight: BaseFilterBiLogic
    {
        protected readonly float? From;
        protected readonly float? To;
        
        public FilterByRangeWeight(float? from, float? to, bool filterIsPositive) : base(filterIsPositive)
        {
            From = from;
            To = to;
        }

        public override bool Check(IObjectForRule obj)
        {
            if (obj.CalculationParameters?.TotalWeight is null
                && (obj.CalculationParameters?.PreOrderItems == null
                    || obj.CalculationParameters.PreOrderItems.Count == 0))
            {
                // сравнивать не с чем
                return false;
            }

            if (From is null
                && To is null)
                return true;

            var weightByObject =
                obj.CalculationParameters.TotalWeight
                ?? obj.CalculationParameters.PreOrderItems.Sum(item => item.Weight * item.Amount);
            
            var result = (From is null || weightByObject >= From)
                         && (To is null || weightByObject <= To);

            return FilterIsPositive ? result : !result;
        }
    }
}