using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Orders;

namespace AdvantShop.Payment
{
    public class OrderDataForClosingReceipt
    {
        public decimal OrderSum { get; set; }
        public decimal OrderDiscount { get; set; }
        public decimal PaymentCost { get; set; }
        
        public string PaymentKey { get; set; }
        public string PaymentCurrencyIso3 { get; set; }
        public int? PaymentTaxType { get; set; }
        public decimal? PaymentTaxRate { get; set; }
        
        public decimal ShippingCostWithDiscount { get; set; }
        public int ShippingTaxType { get; set; }
        public int ShippingPaymentMethodType { get; set; }
        public int ShippingPaymentSubjectType { get; set; }
        
        public List<OrderItemForClosingReceipt> OrderItems { get; set; }
        public List<CertificateItemForClosingReceipt> CertificateItems { get; set; }

        public static OrderDataForClosingReceipt CreateBy(Order order)
        {
            _ = order ?? throw new ArgumentNullException(nameof(order));
            
            var orderDataForClosingReceipt = new OrderDataForClosingReceipt
            {
                OrderSum = (decimal)Math.Round(order.Sum, 2),
                OrderDiscount = (decimal)Math.Round(order.DiscountCost + order.BonusCost, 2),
                PaymentCost = (decimal)Math.Round(order.PaymentCost, 2),
            };
            var orderPaymentMethod = order.PaymentMethod;
            if (orderPaymentMethod != null)
            {
                orderDataForClosingReceipt.PaymentKey = orderPaymentMethod.PaymentKey;
                orderDataForClosingReceipt.PaymentCurrencyIso3 = orderPaymentMethod.PaymentCurrency?.Iso3;
                
                var tax = orderPaymentMethod.TaxId.HasValue
                    ? Taxes.TaxService.GetTax(orderPaymentMethod.TaxId.Value) 
                    : null;
                orderDataForClosingReceipt.PaymentTaxType = tax != null ? (int?)tax.TaxType : null;
                orderDataForClosingReceipt.PaymentTaxRate = tax != null ? (decimal)tax.Rate : (decimal?)null;
            }

            orderDataForClosingReceipt.ShippingCostWithDiscount = (decimal)Math.Round(order.ShippingCostWithDiscount, 2);
            orderDataForClosingReceipt.ShippingTaxType = (int)order.ShippingTaxType;
            orderDataForClosingReceipt.ShippingPaymentMethodType = (int)order.ShippingPaymentMethodType;
            orderDataForClosingReceipt.ShippingPaymentSubjectType = (int)order.ShippingPaymentSubjectType;

            orderDataForClosingReceipt.OrderItems = order.OrderItems
                ?.Select(OrderItemForClosingReceipt.CreateBy)
                .ToList();
            
            orderDataForClosingReceipt.CertificateItems = order.OrderCertificates
                ?.Select(CertificateItemForClosingReceipt.CreateBy)
                .ToList();
            
            return orderDataForClosingReceipt;
        }
    }

    public class OrderItemForClosingReceipt
    {
        public string ArtNo { get; set; }
        public string Name { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
        public decimal Amount { get; set; }
        public decimal Price { get; set; }
        public int? TaxType { get; set; }
        public decimal? TaxRate { get; set; }
        public int PaymentMethodType { get; set; }
        public int PaymentSubjectType { get; set; }
        public int? MeasureType { get; set; }
        public string Unit { get; set; }

        public static OrderItemForClosingReceipt CreateBy(OrderItem orderItem)
        {
            return new OrderItemForClosingReceipt
            {
                ArtNo = orderItem.ArtNo,
                Name = orderItem.Name,
                Size = orderItem.Size,
                Color = orderItem.Color,
                Amount = (decimal)orderItem.Amount,
                Price = (decimal)Math.Round(orderItem.Price, 2),
                TaxType = orderItem.TaxType.HasValue ? (int) orderItem.TaxType.Value : (int?)null,
                TaxRate = orderItem.TaxRate.HasValue ? (decimal) orderItem.TaxRate.Value : (decimal?)null,
                PaymentMethodType = (int)orderItem.PaymentMethodType,
                PaymentSubjectType = (int)orderItem.PaymentSubjectType,
                MeasureType = orderItem.MeasureType.HasValue ? (int) orderItem.MeasureType.Value : (int?)null,
                Unit = orderItem.Unit,
            };
        }
    }

    public class CertificateItemForClosingReceipt
    {
        public string Code { get; set; }
        public decimal Price { get; set; }
        public int? TaxType { get; set; }
        public decimal? TaxRate { get; set; }
        public int PaymentMethodType { get; set; }
        public int PaymentSubjectType { get; set; }

        public static CertificateItemForClosingReceipt CreateBy(GiftCertificate certificateItem)
        {
            var certTax = Taxes.TaxService.GetCertificateTax();
            
            return new CertificateItemForClosingReceipt
            {
                Code = certificateItem.CertificateCode,
                Price = (decimal)Math.Round(certificateItem.Sum, 2),
                TaxType = certTax != null ? (int) certTax.TaxType : (int?)null,
                TaxRate = certTax != null ? (decimal) certTax.Rate : (decimal?)null,
                PaymentMethodType = (int)Configuration.SettingsCertificates.PaymentMethodType,
                PaymentSubjectType = (int)Configuration.SettingsCertificates.PaymentSubjectType,
            };
        }
    }
}