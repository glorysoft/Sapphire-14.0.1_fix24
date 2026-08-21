using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Payment.Alfabank;
using AdvantShop.Orders;
using AdvantShop.Taxes;

namespace AdvantShop.Payment
{
    public partial class Alfabank : ICloseReceipt
    {
        public CloseReceiptResult CloseReceipt(Order order)
        {
            if (!SendReceiptData)
                return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.Alfabank.SendReceiptDataIsDisabled"));

            var alfaOrderId = OrderService.GetOrderAdditionalData(order.OrderID, KeyNamePaymentIdInOrderAdditionalData);

            if (alfaOrderId.IsNullOrEmpty())
                return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.Alfabank.PaymentIdNotFound"));

            var service = new AlfabankService(GatewayUrl, UserName, Password, MerchantLogin, useFfd12: TypeFfd == EnTypeFfd.From1_2);
            var alfabankOrder = service.GetOrderStatus(alfaOrderId, merchantOrderid: null);
            if (alfabankOrder == null 
                || alfabankOrder.ErrorCode != 0 
                || alfabankOrder.OrderStatus != "2")
                return CloseReceiptResult.CreateFailedResult(
                    $"{LocalizationService.GetResource("Core.Payment.Alfabank.PaymentIsNotConfirmed")} (Status: {alfabankOrder?.OrderStatus})");
            
            var tax = TaxId.HasValue ? TaxService.GetTax(TaxId.Value) : null;
            var response = service.CloseReceipt(alfaOrderId, order, Taxation, PaymentCurrency, tax);
            
            if (response != null
                && response.ErrorCode == 0)
                return CloseReceiptResult.CreateSuccessResult();

            return response != null
                ? CloseReceiptResult.CreateFailedResult(
                    message: response.ErrorMessage ?? LocalizationService.GetResource("Core.Payment.Alfabank.SomethingWentWrong"),
                    errorCode: response.ErrorCode.ToString())
                : CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.Alfabank.SomethingWentWrong"));
        }
    }
}