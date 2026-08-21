using AdvantShop.Core.Services.Catalog;
using AdvantShop.Orders;
using AdvantShop.Payment;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Localization;

namespace AdvantShop.Shipping.Sberlogistic
{
	public class SberlogisticOption : BaseShippingOption
    {
        public List<SberlogisticShippingPoint> ShippingPoints { get; set; }
        public SberlogisticCalculateOption CalculateOption { get; set; }
        public float BasePrice { get; set; }
        public float PriceCash { get; set; }

        public override string TemplateName
        {
            get { return "SberlogisticOption.html"; }
        }

        public SberlogisticOption() { }
        public SberlogisticOption(ShippingMethod method, float preCost)
            : base(method, preCost)
        {
        }

        public override void Update(BaseShippingOption option)
        {
            var opt = option as SberlogisticOption;

            if (opt != null && opt.Id == this.Id && opt.ShippingPoints != null)
            {
                this.SelectedPoint = opt.SelectedPoint != null && this.ShippingPoints != null ? this.ShippingPoints.FirstOrDefault(x => x.Id == opt.SelectedPoint.Id) : null;
                // this.SelectedPoint = this.SelectedPoint ?? opt.ShippingPoints.FirstOrDefault();
            }
        }

        public override OrderPickPoint GetOrderPickPoint()
        {
            return new OrderPickPoint
            {
                PickPointId = SelectedPoint == null ? string.Empty : SelectedPoint.Id.ToString(),
                PickPointAddress = SelectedPoint == null ? string.Empty : SelectedPoint.Address,
                AdditionalData = JsonConvert.SerializeObject(CalculateOption)
            };
        }

        public override bool ApplyPay(BasePaymentOption payOption)
        {
            if (payOption?.GetDetails()?.IsCashOnDeliveryPayment is true)
                Rate = PriceCash;
            else
                Rate = BasePrice;
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
