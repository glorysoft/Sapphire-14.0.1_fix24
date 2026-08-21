using System;
using System.Collections.Generic;
using AdvantShop.Core.Common;

namespace AdvantShop.Core.Services.Payment.Thawani.Api
{
    #region Base

    public class BaseResponse
    {
        public bool Success { get; set; }

        /// <summary>
        /// Код ответа.
        /// </summary>
        public int Code { get; set; }

        public string Description { get; set; }

    }

    public class BaseResponse<T> : BaseResponse
        where T : class
    {
        public T Data { get; set; }
    }

    #endregion Base

    #region CreateSession

    public class CreateSession
    {
        public string ClientReferenceId { get; set; }
        public EnModeOfCreateSession Mode { get; set; }
        public List<Product> Products { get; set; }
        public string CustomerId { get; set; }
        public string SuccessUrl { get; set; }
        public string CancelUrl { get; set; }
        // public string ReturnUrl { get; set; }
        public bool? SaveCardOnSuccess { get; set; }
        public int? ExpireInMinutes { get; set; }
        public string PlanId { get; set; }
        public Dictionary<string, string> Metadata { get; set; }
    }

    public class Product
    {
        public string Name { get; set; }
        public int Quantity { get; set; }
        public int UnitAmount { get; set; }
    }

    public class CheckoutModel
    {
        public string SessionId { get; set; }
        public string ClientReferenceId { get; set; }
        public string CustomerId { get; set; }
        public List<Product> Products { get; set; }
        public int TotalAmount { get; set; }
        public string Currency { get; set; }
        public string SuccessUrl { get; set; }
        public string CancelUrl { get; set; }
        // public string ReturnUrl { get; set; }
        public EnPaymentStatus PaymentStatus { get; set; }
        public string Mode { get; set; }
        public string Invoice { get; set; }
        public Dictionary<string, string> Metadata { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? ExpireAt { get; set; }
    }

    public class EnModeOfCreateSession : StringEnum<EnModeOfCreateSession>
    {
        public EnModeOfCreateSession(string value) : base(value)
        { }

        public static EnModeOfCreateSession Payment => new EnModeOfCreateSession("payment");
        public static EnModeOfCreateSession Subscription => new EnModeOfCreateSession("subscription");
    }
    
    public class EnPaymentStatus : StringEnum<EnPaymentStatus>
    {
        public EnPaymentStatus(string value) : base(value)
        { }

        public static EnPaymentStatus UnPaid => new EnPaymentStatus("unpaid");

        public static EnPaymentStatus Paid => new EnPaymentStatus("paid");

        public static EnPaymentStatus Cancelled => new EnPaymentStatus("cancelled");
    }

    #endregion CreateSession
}