using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Payment.YandexKassa;
using AdvantShop.Orders;
using AdvantShop.Taxes;

namespace AdvantShop.Payment
{
    public partial class YandexKassa : ICloseReceipt
    {
        public CloseReceiptResult CloseReceipt(Order order)
        {
            if (!SendReceiptData)
                return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.YandexKassa.SendReceiptDataIsDisabled"));

            var paymentId = OrderService.GetOrderAdditionalData(order.OrderID, KeyNamePaymentIdInOrderAdditionalData);

            if (paymentId.IsNullOrEmpty())
                return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.YandexKassa.PaymentIdNotFound"));
            
            var service = new YandexKassaApiService(ShopId, SecretKey);
            var payment = service.GetPayment(paymentId);

            // иногда не удается получить данные о платеже в следствии
            // The request was aborted: Could not create SSL/TLS secure channel.
            if (payment == null)
                payment = service.GetPayment(paymentId);
                    
            if (payment == null
                || payment.Status != "succeeded")
                return CloseReceiptResult.CreateFailedResult(
                    $"{LocalizationService.GetResource("Core.Payment.YandexKassa.PaymentIsNotConfirmed")} (Status: {payment?.Status})");

            var tax = TaxId.HasValue 
                ? TaxService.GetTax(TaxId.Value) 
                : null;
            
            var closeReceipt = service.CloseReceipt(
                order,
                payment,
                PaymentCurrency,
                tax,
                TaxSystemCode,
                useFfd12: TypeFfd == EnTypeFfd.From1_2);
            
            if (closeReceipt != null
                && closeReceipt.Status != ReceiptStatus.Canceled)
                return CloseReceiptResult.CreateSuccessResult();

            return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.YandexKassa.SomethingWentWrong"));

        }
    }
}