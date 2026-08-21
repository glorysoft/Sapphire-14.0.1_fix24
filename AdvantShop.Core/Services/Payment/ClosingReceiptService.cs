using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Core.Services.Taxes;
using AdvantShop.Diagnostics;
using AdvantShop.Orders;
using Newtonsoft.Json;

namespace AdvantShop.Payment
{
    public class ClosingReceiptService
    {
        public static void SaveOrderState(Order order)
        {
            _ = order ?? throw new ArgumentNullException(nameof(order));
            
            var state = OrderDataForClosingReceipt.CreateBy(order);
            OrderService.SetOrderStateOfClosingReceipt(order.OrderID, JsonConvert.SerializeObject(state));
        }
        
        public static CloseReceiptResult CloseReceipt(int orderId)
        {
            var order = OrderService.GetOrder(orderId);
            if (order is null)
                return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.ClosingReceipt.OrderNotFound"));
            
            return CloseReceipt(order);
        }
        
        public static CloseReceiptResult CloseReceipt(Order order)
        {
            _ = order ?? throw new ArgumentNullException(nameof(order));

            var pristineShippingPaymentSubjectType = order.ShippingPaymentSubjectType;
            try
            {
                if (OrderService.GetClosingReceiptStatus(order.OrderID) == EnClosingReceiptStatus.Success)
                    return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.ClosingReceipt.IsAlreadyClosed"));

                if (!order.Payed)
                {
                    OrderService.SetClosingReceiptAsError(order.OrderID, LocalizationService.GetResource("Core.Payment.ClosingReceipt.OrderIsNotPayed"));
                    return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.ClosingReceipt.OrderIsNotPayed"));
                }

                if (order.PaymentMethod is null)
                {
                    OrderService.SetClosingReceiptAsError(order.OrderID, LocalizationService.GetResource("Core.Payment.ClosingReceipt.PaymentMethodNotFound"));
                    return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.ClosingReceipt.PaymentMethodNotFound"));
                }

                var paymentCloseReceipt = order.PaymentMethod as ICloseReceipt;
                if (paymentCloseReceipt == null)
                {
                    OrderService.SetClosingReceiptAsError(order.OrderID, LocalizationService.GetResource("Core.Payment.ClosingReceipt.PaymentMethodNotSupportedClosingReceipt"));
                    return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.ClosingReceipt.PaymentMethodNotSupportedClosingReceipt"));
                }
                
                if (!ValidateState(order, out var validateStateMessage))
                {
                    OrderService.SetClosingReceiptAsError(order.OrderID, validateStateMessage ?? LocalizationService.GetResource("Core.Payment.ClosingReceipt.OrderStateDoNotMatch"));
                    return CloseReceiptResult.CreateFailedResult(validateStateMessage ?? LocalizationService.GetResource("Core.Payment.ClosingReceipt.OrderStateDoNotMatch"));
                }

                if (!ValidateMarking(order))
                {
                    OrderService.SetClosingReceiptAsNeedMarking(order.OrderID);
                    return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.ClosingReceipt.NeedMarking"), needMarking: true);
                }

                if (order.ShippingPaymentSubjectType == ePaymentSubjectType.payment)
                    order.ShippingPaymentSubjectType = ePaymentSubjectType.service;
                
                var closeReceiptResult = paymentCloseReceipt.CloseReceipt(order);
                if (!closeReceiptResult.Success)
                {
                    if (closeReceiptResult.NeedMarking)
                        OrderService.SetClosingReceiptAsNeedMarking(order.OrderID);
                    else
                        OrderService.SetClosingReceiptAsError(order.OrderID, closeReceiptResult.Message);
                }
                else
                    OrderService.SetClosingReceiptAsSuccess(order.OrderID);
            
                return closeReceiptResult;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                return CloseReceiptResult.CreateFailedResult(ex.Message);
            }
            finally
            {
                order.ShippingPaymentSubjectType = pristineShippingPaymentSubjectType;
            }
        }

        private static bool ValidateMarking(Order order)
        {
            foreach (var item in order.OrderItems)
            {
                if (!item.IsMarkingRequired)
                    continue;

                var markingItems = MarkingOrderItemService.GetMarkingItems(item.OrderItemID);
                var amountMarking = (int) Math.Ceiling(item.Amount);
                if (markingItems.Count(x => !string.IsNullOrWhiteSpace(x.Code)) != amountMarking
                    || item.Amount <= 0)
                    return false;
            }
            
            return true;
        }

        private static bool ValidateState(Order order, out string message)
        {
            var state = GetOrderState(order.OrderID);
            if (state == null)
            {
                message = LocalizationService.GetResource("Core.Payment.ClosingReceipt.OrderStateIsMissing");
                return false;
            }

            var currentState = OrderDataForClosingReceipt.CreateBy(order);
            message = null;
            return EqualStates(state, currentState);
        }

        private static OrderDataForClosingReceipt GetOrderState(int orderId)
        {
            var stateJson = OrderService.GetOrderStateOfClosingReceipt(orderId);
            return string.IsNullOrWhiteSpace(stateJson)
                ? null
                : JsonConvert.DeserializeObject<OrderDataForClosingReceipt>(stateJson);
        }

        private static bool EqualStates(OrderDataForClosingReceipt a, OrderDataForClosingReceipt b)
        {
            if (a is null
                || b is null)
                return false;

            if (a.OrderSum != b.OrderSum
                || a.OrderDiscount != b.OrderDiscount
                || a.PaymentCost != b.PaymentCost
                || a.PaymentKey != b.PaymentKey
                || a.PaymentCurrencyIso3 != b.PaymentCurrencyIso3
                || a.PaymentTaxType != b.PaymentTaxType
                || a.PaymentTaxRate != b.PaymentTaxRate
                || a.ShippingCostWithDiscount != b.ShippingCostWithDiscount
                || a.ShippingTaxType != b.ShippingTaxType
                || a.ShippingPaymentMethodType != b.ShippingPaymentMethodType
                || a.ShippingPaymentSubjectType != b.ShippingPaymentSubjectType
               )
                return false;

            if (!EqualOrderItems())
                return false;

            if (!EqualCertificateItems())
                return false;

            return true;

            bool EqualOrderItems()
            {
                if ((a.OrderItems?.Count ?? 0) != (b.OrderItems?.Count ?? 0))
                    return false;

                if (a.OrderItems == null
                    || b.OrderItems == null) 
                    return true;
                
                var findItemsIndex = new HashSet<int>(a.OrderItems.Count);
                foreach (var item in a.OrderItems)
                {
                    var findedIndex = -1;
                    for (var i = 0; i < b.OrderItems.Count; i++)
                    {
                        if (findItemsIndex.Contains(i))
                            continue;

                        var item2 = b.OrderItems[i];
                        if (string.Equals(item.ArtNo, item2.ArtNo, StringComparison.OrdinalIgnoreCase)
                            && string.Equals(item.Name, item2.Name, StringComparison.OrdinalIgnoreCase)
                            && string.Equals(item.Size, item2.Size, StringComparison.OrdinalIgnoreCase)
                            && string.Equals(item.Color, item2.Color, StringComparison.OrdinalIgnoreCase)
                            && item.Amount == item2.Amount
                            && item.Price == item2.Price
                            && item.TaxType == item2.TaxType
                            && item.TaxRate == item2.TaxRate
                            && item.PaymentMethodType == item2.PaymentMethodType
                            && item.PaymentSubjectType == item2.PaymentSubjectType
                            && item.MeasureType == item2.MeasureType
                            && string.Equals(item.Unit, item2.Unit, StringComparison.OrdinalIgnoreCase)
                           )
                        {
                            findedIndex = i;
                            break;
                        }
                    }

                    if (findedIndex == -1)
                        return false;
                    
                    findItemsIndex.Add(findedIndex);
                }

                return true;
            }

            bool EqualCertificateItems()
            {
                if ((a.CertificateItems?.Count ?? 0) != (b.CertificateItems?.Count ?? 0))
                    return false;

                if (a.CertificateItems == null
                    || b.CertificateItems == null) 
                    return true;
                
                var findItemsIndex = new HashSet<int>(a.CertificateItems.Count);
                foreach (var item in a.CertificateItems)
                {
                    var findedIndex = -1;
                    for (var i = 0; i < b.CertificateItems.Count; i++)
                    {
                        if (findItemsIndex.Contains(i))
                            continue;

                        var item2 = b.CertificateItems[i];
                        if (string.Equals(item.Code, item2.Code, StringComparison.OrdinalIgnoreCase)
                            && item.Price == item2.Price
                            && item.TaxType == item2.TaxType
                            && item.TaxRate == item2.TaxRate
                            && item.PaymentMethodType == item2.PaymentMethodType
                            && item.PaymentSubjectType == item2.PaymentSubjectType
                           )
                        {
                            findedIndex = i;
                            break;
                        }
                    }

                    if (findedIndex == -1)
                        return false;
                    
                    findItemsIndex.Add(findedIndex);
                }

                return true;
            }
        }
    }
}