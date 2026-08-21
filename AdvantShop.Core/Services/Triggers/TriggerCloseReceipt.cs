using System;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Loging.Triggers.Logs;
using AdvantShop.Core.Services.Mails;
using AdvantShop.Diagnostics;
using AdvantShop.Orders;
using AdvantShop.Payment;
using AdvantShop.Saas;

namespace AdvantShop.Core.Services.Triggers
{
    public class TriggerCloseReceipt
    {
        public bool CloseReceipt(TriggerAction action, ITriggerObject triggerObject, ITriggerLogger logger)
        {
            if (!(triggerObject is Order order))
            {
                logger.Error(TriggerLogEventType.CloseReceipt, "Действие применяется только к заказу", action.Id);
                
                return false;
            }

            try
            {
                if (SaasDataService.IsSaasEnabled && !SaasDataService.CurrentSaasData.HaveTriggerCloseReceipt)
                {
                    logger.Error(TriggerLogEventType.CloseReceipt, "Не доступно по тарифу", action.Id);
                    SendMail(action, order, "Не доступно по тарифу");
                    
                    return false;
                }
                var closeReceiptResult = ClosingReceiptService.CloseReceipt(order);
                if (closeReceiptResult == null || !closeReceiptResult.Success)
                {
                    var errorMessage =
                        closeReceiptResult?.Message ??
                        LocalizationService.GetResource("Core.Triggers.Action.CloseReceipt.UnknownResult");
                    
                    SendMail(action, order, errorMessage);
                    
                    logger.Error(TriggerLogEventType.CloseReceipt, errorMessage, action.Id);
                }
                else
                {
                    logger.Success(TriggerLogEventType.CloseReceipt, action.Id);
                }

                return closeReceiptResult?.Success ?? false;
            }
            catch(Exception ex)
            {
                Debug.Log.Error(ex);
                logger.Error(TriggerLogEventType.CloseReceipt, ex.Message, action.Id);
                
                return false;
            }
        }

        private void SendMail(TriggerAction action, Order order, string errorMessage)
        {
            var data = action.CloseReceiptData;
            if (data == null)
                return;
            
            if (!data.SendEmailOnError
                || data.EmailForError.IsNullOrEmpty()
                || data.EmailBody.IsNullOrEmpty()
                || data.EmailSubject.IsNullOrEmpty())
                return;

            var subject = ReplaceVariablesForOrder(data.EmailSubject, order, null);
            var body = ReplaceVariablesForOrder(data.EmailBody, order, errorMessage);
            
            MailService.SendMailNow(Guid.Empty, data.EmailForError, subject, body, true);
        }

        private string ReplaceVariablesForOrder(string value, Order order, string errorMessage)
        {
            value = value.Replace("#OrderId#", order.OrderID.ToString())
                .Replace("#Number#", order.Number)
                .Replace("#IsPaid#", order.Payed.ToLowerString())
                .Replace("#Sum#", order.Sum.ToString("#.##"))
                .Replace("#Status#", order.OrderStatus.StatusName)
                .Replace("#ShippingMethod#",
                    order.ArchivedShippingName +
                    (order.OrderPickPoint != null ? " " + order.OrderPickPoint.PickPointAddress : ""))
                .Replace("#PaymentMethod#", order.ArchivedPaymentName)
                .Replace("#ErrorMessage#", errorMessage);
            
            return value;
        }
    }
}