using System;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Repository.Currencies;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping
{
    public class ShippingMethodAdapterForRule : IObjectForRule
    {
        protected readonly ShippingMethod Method;
        protected bool MethodEnabled;

        public ShippingCalculationParameters CalculationParameters { get; }

        public ShippingMethodAdapterForRule(ShippingMethod method, ShippingCalculationParameters calculationParameters)
        {
            Method = method ?? throw new ArgumentNullException(nameof(method));
            MethodEnabled = method.Enabled;
            CalculationParameters = calculationParameters ?? throw new ArgumentNullException(nameof(calculationParameters));
        }

        public ShippingMethod ShippingMethod => Method;

        public int Id => Method.ShippingMethodId;
        public string Type => Method.ShippingType;
        public float? Cost => null;
        public Currency Currency => Method.ShippingCurrency;
        public bool Enabled => MethodEnabled;
        public void ChangeCost(float cost) { }

        public void ChangeEnable(bool enable)
        {
            MethodEnabled = enable;
        }
    }
}