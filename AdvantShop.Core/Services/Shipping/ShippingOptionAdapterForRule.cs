using System;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Repository.Currencies;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping
{
    public class ShippingOptionAdapterForRule : IObjectForRule
    {
        protected readonly BaseShippingOption Option;
        protected bool OptionEnabled = true;
        public ShippingCalculationParameters CalculationParameters { get; }

        public ShippingOptionAdapterForRule(BaseShippingOption shippingOption, ShippingCalculationParameters calculationParameters)
        {
            Option = shippingOption ?? throw new ArgumentNullException(nameof(shippingOption));
            CalculationParameters = calculationParameters ?? throw new ArgumentNullException(nameof(calculationParameters));
        }
        
        public BaseShippingOption ShippingOption => Option;

        public int Id => Option.MethodId;
        public string Type => Option.ShippingType;
        public float? Cost => Option.FinalRate;
        public Currency Currency => Option.ShippingCurrency;
        public bool Enabled => OptionEnabled;
        public void ChangeCost(float cost)
        {
            Option.FrozenRate = cost;
        }

        public void ChangeEnable(bool enable)
        {
            OptionEnabled = enable;
        }
    }
}