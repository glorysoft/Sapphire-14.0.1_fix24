using System;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Services.Payment;

namespace AdvantShop.Web.Infrastructure.Admin.PaymentMethods
{
    [PaymentAdminModel("GiftCertificate")]
    public class GiftCertificatePaymentModel : PaymentMethodAdminModel
    {
        public override string PaymentViewPath { get { return null; } }

        public override Tuple<string, string> Instruction
        {
            get { return new Tuple<string, string>($"{LinkService.Internal.AccountPlatform}/help/pages/payment-giftcertificate", "Инструкция. Подарочный сертификат"); }
        }
    }
}
