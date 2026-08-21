using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Payment.Tinkoff;
using AdvantShop.Orders;

namespace AdvantShop.Payment
{
    public partial class Tinkoff : ICloseReceipt
    {
        public CloseReceiptResult CloseReceipt(Order order)
        {
            if (!SendReceiptData)
                return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.Tinkoff.SendReceiptDataIsDisabled"));

            var paymentId = OrderService.GetOrderAdditionalData(order.OrderID, KeyNamePaymentIdInOrderAdditionalData);

            if (paymentId.IsNullOrEmpty())
                return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.Tinkoff.PaymentIdNotFound"));
            
            var service = new TinkoffService(TerminalKey, SecretKey, SendReceiptData, useFfd12: TypeFfd == EnTypeFfd.From1_2);
            var statePayment = service.GetState(paymentId);
            if (statePayment == null
                || statePayment.Status != "CONFIRMED") 
                return CloseReceiptResult.CreateFailedResult(
                    $"{LocalizationService.GetResource("Core.Payment.Tinkoff.PaymentIsNotConfirmed")} (Status: {statePayment?.Status})");
  
            var tax = TaxId.HasValue
                ? Taxes.TaxService.GetTax(TaxId.Value) 
                : null;
                    
            var response = service.CloseReceipt(
                paymentId,
                statePayment.Amount,
                order, 
                Taxation, 
                PaymentCurrency, 
                tax,
                MarkCodeType);
            
            if (response?.Success is true)
                return CloseReceiptResult.CreateSuccessResult();

            return response != null
                ? CloseReceiptResult.CreateFailedResult(
                    message: response.Message ?? response.Details ?? LocalizationService.GetResource("Core.Payment.Tinkoff.SomethingWentWrong"),
                    errorCode: response.ErrorCode)
                : CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.Tinkoff.SomethingWentWrong"));
        }
    }
}