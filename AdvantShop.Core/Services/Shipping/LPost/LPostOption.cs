using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Payment;

namespace AdvantShop.Shipping.LPost
{
    public class LPostOption : BaseShippingOption
    {
        public LPostOption() { }

        public LPostOption(ShippingMethod method) : base(method) { }

        public LPostOption(ShippingMethod method, float preCost)
            : base(method, preCost)  { }

        public float BasePrice { get; set; }
        public float PriceCash { get; set; }

        public override bool ApplyPay(BasePaymentOption payOption)
        {
            if (payOption?.GetDetails()?.IsCashOnDeliveryPayment is true)
                Rate = PriceCash;
            else
            {
                Rate = BasePrice;
            }
            return true;
        }

        public override string GetDescriptionForPayment()
        {
            var diff = PriceCash - BasePrice;
            if (diff <= 0)
                return string.Empty;

            return LocalizationService.GetResourceFormat("AdvantShop.Core.Shipping.CostOfDelivery.ShippingCostUp", diff.RoundPrice().FormatPrice());
        }
    }
}
