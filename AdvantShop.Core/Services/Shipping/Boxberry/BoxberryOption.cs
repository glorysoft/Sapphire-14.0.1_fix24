using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Payment;

namespace AdvantShop.Shipping.Boxberry
{
    public class BoxberryOption : BaseShippingOption
    {
        public BoxberryOption() { }

        public BoxberryOption(ShippingMethod method, float preCost)
            : base(method, preCost)
        {
            HideAddressBlock = false;
        }

        public float BasePrice { get; set; }
        public float PriceCash { get; set; }
        public bool OnlyPrepaidOrders { get; set; }
        public override bool IsAvailablePaymentCashOnDelivery { get { return OnlyPrepaidOrders == false; } }

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