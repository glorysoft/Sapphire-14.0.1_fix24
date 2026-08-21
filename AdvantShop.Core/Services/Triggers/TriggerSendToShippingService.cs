using AdvantShop.Core.Common;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Mails;
using AdvantShop.Diagnostics;
using AdvantShop.Orders;
using AdvantShop.Shipping;
using System;
using System.Linq;
using AdvantShop.Core.Services.Loging.Triggers;
using AdvantShop.Core.Services.Loging.Triggers.Logs;

namespace AdvantShop.Core.Services.Triggers
{
    public class TriggerSendToShippingService
    {
        private readonly TriggerRule _trigger;
        private readonly TriggerAction _action;
        private readonly ITriggerObject _triggerObject;
        private readonly ITriggerLogger _logger;

        public TriggerSendToShippingService(
            TriggerRule trigger, 
            TriggerAction action, 
            ITriggerObject triggerObject, 
            ITriggerLogger logger
        )
        {
            _trigger = trigger;
            _action = action;
            _triggerObject = triggerObject;
            _logger = logger;
        }
        
        public bool SendToShippingService()
        {
            if (!(_triggerObject is Order order) || order.ShippingMethod == null)
            {
                _logger.Error(TriggerLogEventType.SendToShippingService, "Действие применяется только к заказу с методом доставки", _action.Id);
                
                return false;
            }

            if (!ShippingMethodService.ShippingMethodTypesUseUnloadOrder.Contains(order.ShippingMethod.ShippingType))
            {
                var errorMsg = LocalizationService.GetResource("Core.Triggers.Action.SendToShippingService.UnloadOrderNotSupport");
                ErrorProcess(order, errorMsg);

                _logger.Error(
                    TriggerLogEventType.SendToShippingService,
                    errorMsg,
                    _action.Id,
                    new { order.ShippingMethodName });

                return false;
            }

            try
            {
                var shippingCalculationParameters = ShippingCalculationConfigurator.Configure()
                    .ByOrder(order)
                    .Build();
                var type = ReflectionExt
                    .GetTypeByAttributeValue<ShippingKeyAttribute>(typeof(BaseShipping), atr => atr.Value, order.ShippingMethod.ShippingType);

                var shipping = (BaseShipping)Activator.CreateInstance(type, order.ShippingMethod, shippingCalculationParameters);
                var unloadOrderHandler = shipping as IUnloadOrder;
                if (unloadOrderHandler is null)
                {
                    var errorMsg = LocalizationService.GetResource("Core.Triggers.Action.SendToShippingService.UnloadOrderNotSupport");
                    ErrorProcess(order, errorMsg);

                    _logger.Error(
                        TriggerLogEventType.SendToShippingService,
                        errorMsg,
                        _action.Id,
                        new { order.ShippingMethodName });

                    return false;
                }

                var result = unloadOrderHandler.UnloadOrder(order);
                if (result == null || !result.Success)
                {
                    var errorMessage =
                        result?.Message ??
                        LocalizationService.GetResource("Core.Triggers.Action.SendToShippingService.UnknownResult");
                    
                    ErrorProcess(order, errorMessage);

                    _logger.Error(TriggerLogEventType.SendToShippingService, errorMessage, _action.Id);
                }
                else
                {
                    _logger.Success(TriggerLogEventType.SendToShippingService, _action.Id);
                }

                return result?.Success ?? false;
            }
            catch(Exception ex)
            {
                Debug.Log.Error(ex);
                _logger.Error(TriggerLogEventType.SendToShippingService, ex.Message, _action.Id);
                
                return false;
            }
        }
        
        private void ErrorProcess(Order order, string errorMessage)
        {
            SendMail(order, errorMessage);
            ChangeOrderStatus(order);
        }

        private void ChangeOrderStatus(Order order)
        {
            if (_action.SendToShippingServiceData.OrderStatusOnError == null)
                return;

            OrderStatusService.ChangeOrderStatus(
                order.OrderID,
                _action.SendToShippingServiceData.OrderStatusOnError.Value,
                LocalizationService.GetResourceFormat(
                    "Core.Triggers.Action.SendToShippingService.OrderChangedBy",
                    _trigger.Name
                )
            );
        }

        private void SendMail(Order order, string errorMessage)
        {
            if (!_action.SendToShippingServiceData.SendEmailOnError
                || _action.SendToShippingServiceData.EmailForError.IsNullOrEmpty()
                || _action.SendToShippingServiceData.EmailBody.IsNullOrEmpty()
                || _action.SendToShippingServiceData.EmailSubject.IsNullOrEmpty())
                return;

            var subject = ReplaceVariablesForOrder(_action.SendToShippingServiceData.EmailSubject, order, null);
            var body = ReplaceVariablesForOrder(_action.SendToShippingServiceData.EmailBody, order, errorMessage);
            
            MailService.SendMailNow(Guid.Empty, _action.SendToShippingServiceData.EmailForError, subject, body, true);
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
