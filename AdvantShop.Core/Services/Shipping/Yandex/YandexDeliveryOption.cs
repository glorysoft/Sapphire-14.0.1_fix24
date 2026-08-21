using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Orders;
using AdvantShop.Payment;
using AdvantShop.Shipping.Yandex.Api;
using Newtonsoft.Json;

namespace AdvantShop.Shipping.Yandex
{
    public class YandexDeliveryOption : BaseShippingOption
    {
        public YandexDeliveryCalculateOption CalculateOption { get; set; }
        public IntervalOffer SelectedInterval { get; set; }
        public float BasePrice { get; set; }
        public float PriceCash { get; set; }

        public List<YandexDeliveryShippingPoint> ShippingPoints { get; set; }
        public List<IntervalOffer> Intervals { get; set; }
        public string FormattedDateOfDelivery { get; set; }
        private IEnumerable<string> _datesOfDelivery;
        public IEnumerable<string> DatesOfDelivery => _datesOfDelivery ?? (_datesOfDelivery = TimesOfDelivery?.Keys);
        public Dictionary<string, List<IntervalOffer>> TimesOfDelivery { get; set; }
        public int? PaymentCodCardId { get; set; }
        public int? PaymentCodCashId { get; set; }
        public bool CashOnDeliveryCardAvailable { get; set; }
        public bool CashOnDeliveryCashAvailable { get; set; }
        public override bool IsAvailablePaymentCashOnDelivery => CashOnDeliveryCardAvailable || CashOnDeliveryCashAvailable;

        public YandexDeliveryOption()
        {
        }

        public YandexDeliveryOption(ShippingMethod method, float preCost)
            : base(method, preCost)
        {
        }
 
        public override string TemplateName
        {
            get { return "YandexDeliveryOption.html"; }
        }

        public override void Update(BaseShippingOption option)
        {
            if (option is YandexDeliveryOption opt && opt.Id == this.Id)
            {
                if (opt.ShippingPoints != null)
                {
                    this.SelectedPoint = opt.SelectedPoint != null && this.ShippingPoints != null ? this.ShippingPoints.FirstOrDefault(x => x.Id == opt.SelectedPoint.Id) : null;
                    // this.SelectedPoint = this.SelectedPoint ?? opt.ShippingPoints.FirstOrDefault();
                    if (this.SelectedPoint != null)
                        this.IsAvailablePaymentCashOnDelivery &=
                            this.SelectedPoint.AvailableCashOnDelivery is true || this.SelectedPoint.AvailableCardOnDelivery is true;
                }
                if (opt.SelectedInterval != null && opt.TimesOfDelivery != null)
                {
                    this.SelectedInterval = opt.SelectedInterval;
                    this.CalculateOption.IntervalFrom = opt.SelectedInterval.From;
                    this.CalculateOption.IntervalTo = opt.SelectedInterval.To;
                }
                if (opt.FormattedDateOfDelivery.IsNotEmpty())
                {
                    this.DateOfDelivery = opt.FormattedDateOfDelivery.TryParseDateTime();
                    this.FormattedDateOfDelivery = opt.FormattedDateOfDelivery;
                }
                if (opt.TimeOfDelivery.IsNotEmpty())
                    this.TimeOfDelivery = opt.TimeOfDelivery;
            }
        }

        public override OrderPickPoint GetOrderPickPoint()
        {
            return new OrderPickPoint
            {
                PickPointId = SelectedPoint == null ? string.Empty : SelectedPoint.Id,
                PickPointAddress = SelectedPoint == null ? string.Empty : SelectedPoint.Address,
                AdditionalData = JsonConvert.SerializeObject(CalculateOption)
            };
        }

        public override bool AvailablePayment(BasePaymentOption payOption)
        {
            if (payOption.GetDetails()?.IsCashOnDeliveryPayment is true)
            {
                if (!IsAvailablePaymentCashOnDelivery)
                    return false;

                if (PaymentCodCardId == payOption.Id)
                    return CashOnDeliveryCardAvailable;

                if (PaymentCodCashId == payOption.Id)
                    return CashOnDeliveryCashAvailable;

                return true;
            }

            return base.AvailablePayment(payOption);
        }

        public override bool ApplyPay(BasePaymentOption payOption)
        {
            if (payOption.GetDetails()?.IsCashOnDeliveryPayment is true)
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

        public override void UpdateFromOrderPickPoint(OrderPickPoint orderPickPoint)
        {
            if (orderPickPoint.PickPointId.IsNotEmpty())
                SelectedPoint = ShippingPoints?.FirstOrDefault(x => x.Id == orderPickPoint.PickPointId);
        }
    }
}