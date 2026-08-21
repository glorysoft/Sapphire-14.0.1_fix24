//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Payment.YandexKassa;
using AdvantShop.Customers;
using AdvantShop.Orders;
using AdvantShop.Shipping;
using AdvantShop.Taxes;

namespace AdvantShop.Payment
{
    [PaymentKey("YandexKassa")]
    public partial class YandexKassa : PaymentMethod, ICreditPaymentMethod
    {
        public const string KeyNamePaymentIdInOrderAdditionalData = "YandexKassa_PaymentId";
        public const string ProtocolApi = "Api";
        public const string ProtocolWidget = "Widget";
        public string ShopId { get; set; }
        //public bool DemoMode { get; set; }
        public string YaPaymentType { get; set; }
        private string SecretKey { get; set; }
        public bool SendReceiptData { get; set; }
        //public int VatType { get; set; }
        public string Protocol { get; set; }
        public byte? TaxSystemCode { get; set; }
        public EnTypeFfd TypeFfd { get; set; }
        public float MinimumPrice { get; set; }
        public float? MaximumPrice { get; set; }
        public EnTypePresentationOfCreditInformation TypePresentationOfCreditInformation =>
            EnTypePresentationOfCreditInformation.FirstPayment;
        public float FirstPayment { get; set; }
        public bool ActiveCreditPayment => YaPaymentType == "sber_loan" || YaPaymentType == "sber_bnpl";
        public bool ShowCreditButtonInProductCard => true;
        public string CreditButtonTextInProductCard => 
            YaPaymentType == "sber_bnpl" 
                ? LocalizationService.GetResource("Core.Payment.YandexKassa.CreditButtonTextInProductCard") 
                : null;


        public override ProcessType ProcessType
        {
            get
            {
                switch (Protocol)
                {
                    case ProtocolApi:
                        return ProcessType.ServerRequest;
                    case ProtocolWidget:
                        return ProcessType.Javascript;
                    default:
                        return ProcessType.ServerRequest;
                }
            }
        }

        public override NotificationType NotificationType => NotificationType.ReturnUrl | NotificationType.Handler;

        public override UrlStatus ShowUrls => UrlStatus.NotificationUrl;

        public override string NotificationUrl => base.NotificationUrl.Replace("http://", "https://");

        public override bool CurrencyAllAvailable => false;

        public override string[] CurrencyIso3Available => new[] {"RUB"};

        public override Dictionary<string, string> Parameters
        {
            get
            {
                return new Dictionary<string, string>
                           {
                               {YandexKassaTemplate.ShopID, ShopId},
                               //{YandexKassaTemplate.DemoMode, DemoMode.ToString()},
                               {YandexKassaTemplate.YaPaymentType, YaPaymentType},
                               {YandexKassaTemplate.Password, SecretKey},
                               {YandexKassaTemplate.SendReceiptData, SendReceiptData.ToString()},
                               //{YandexKassaTemplate.VatType, VatType.ToString()}
                               {YandexKassaTemplate.Protocol, Protocol},
                               {YandexKassaTemplate.MinimumPrice, MinimumPrice.ToInvariantString()},
                               {YandexKassaTemplate.MaximumPrice, MaximumPrice?.ToInvariantString()},
                               {YandexKassaTemplate.FirstPayment, FirstPayment.ToInvariantString()},
                               {YandexKassaTemplate.TaxSystemCode, TaxSystemCode?.ToString()},
                               {YandexKassaTemplate.TypeFfd, ((byte?)TypeFfd).ToString()},
                           };
            }
            set
            {
                ShopId = value.ElementOrDefault(YandexKassaTemplate.ShopID);
                YaPaymentType = value.ElementOrDefault(YandexKassaTemplate.YaPaymentType);
                SecretKey = value.ElementOrDefault(YandexKassaTemplate.Password);
                //DemoMode = value.ElementOrDefault(YandexKassaTemplate.DemoMode).TryParseBool();
                SendReceiptData = value.ElementOrDefault(YandexKassaTemplate.SendReceiptData).TryParseBool();
                //VatType = value.ElementOrDefault(YandexKassaTemplate.VatType).TryParseInt();
                var isNewMethod = !value.ContainsKey(YandexKassaTemplate.Protocol);
                Protocol = value.ElementOrDefault(YandexKassaTemplate.Protocol).IsNullOrEmpty() && isNewMethod
                    ? ProtocolApi
                    : value.ElementOrDefault(YandexKassaTemplate.Protocol);
                MinimumPrice = value.ElementOrDefault(YandexKassaTemplate.MinimumPrice).TryParseFloat();
                MaximumPrice = value.ElementOrDefault(YandexKassaTemplate.MaximumPrice).TryParseFloat(true);
                FirstPayment = value.ElementOrDefault(YandexKassaTemplate.FirstPayment).TryParseFloat();
                TaxSystemCode = (byte?)value.ElementOrDefault(YandexKassaTemplate.TaxSystemCode).TryParseInt(true);
                TypeFfd = (EnTypeFfd)value.ElementOrDefault(YandexKassaTemplate.TypeFfd).TryParseInt((int)EnTypeFfd.Less1_2);
            }
        }

        public float? GetFirstPayment(float finalPrice)
        {
            return finalPrice * FirstPayment / 100;
        }

        public (float AmountPyament, int NumberOfPayments) GetAmountAndNumberOfPayments(float finalPrice) => default;

        public override BasePaymentOption GetOption(
            BaseShippingOption shippingOption, 
            float preCoast, 
            CustomerType? customerType
        )
        {
            BasePaymentOption option = null;
            if (Protocol == ProtocolApi && YaPaymentType == "mobile_balance")
            {
                option = new YandexKassaWithPhonePaymentOption(this, preCoast);
            }

            if (option == null)
                option = base.GetOption(shippingOption, preCoast, customerType);

            return option;
        }

        public override string ProcessResponse(HttpContext context)
        {
            if (Protocol == ProtocolWidget && !context.Request.Url.AbsolutePath.Contains("paymentnotification"))
                return ProcessResponseByOrder(context);
            
            if (Protocol == ProtocolApi && context.Request.Url.AbsolutePath.Contains("paymentreturnurl"))
                return ProcessResponseByApiOrder(context);
            
            return ProcessResponseByJson(context);
        }

        #region New Api

        public override string ProcessServerRequest(Order order)
        {
            var tax = TaxId.HasValue ? TaxService.GetTax(TaxId.Value) : null;
            var service = new YandexKassaApiService(ShopId, SecretKey);
            var confirmation = new CreatePaymentConfirmationRedirect()
            {
                // URL, на который вернется пользователь после подтверждения или отмены платежа.
                // На SuccessUrl проверим оплачен заказ или нет ProcessResponseByApiOrder
                ReturnUrl = $"{SuccessUrl}?c={order.Code}"
            };
            var payment =
                SendReceiptData
                    ? service.CreatePaymentWithReceipt(
                        order,
                        YaPaymentType,
                        GetOrderDescription(order.Number),
                        null,
                        PaymentCurrency,
                        tax,
                        confirmation,
                        TaxSystemCode,
                        sendMeasure: TypeFfd == EnTypeFfd.From1_2)
                    : service.CreatePayment(
                        order,
                        YaPaymentType,
                        GetOrderDescription(order.Number),
                        null,
                        PaymentCurrency, confirmation);

            if (payment != null)
                return ((PaymentConfirmationRedirect)payment.Confirmation).ConfirmationUrl;

            return "";
        }

        private string ProcessResponseByJson(HttpContext context)
        {
            string bodyPost = null;

            context.Request.InputStream.Seek(0, SeekOrigin.Begin);
            bodyPost = (new StreamReader(context.Request.InputStream)).ReadToEnd();

            if (!string.IsNullOrEmpty(bodyPost))
            {

                var service = new YandexKassaApiService(ShopId, SecretKey);

                var notify = service.ReadNotifyData(bodyPost);

                if (notify == null || notify.Event != "payment.succeeded" || notify.Object == null || notify.Object.Metadata.OrderNumber.IsNullOrEmpty())
                {
                    return NotificationMessahges.InvalidRequestData;
                }

                var payment = service.GetPayment(notify.Object.Id);

                // иногда не удается получить данные о платеже в следствии
                // The request was aborted: Could not create SSL/TLS secure channel.
                if (payment == null)
                    payment = service.GetPayment(notify.Object.Id);

                if (payment != null && payment.Status == "succeeded")
                {
                    var order = OrderService.GetOrderByNumber(payment.Metadata.OrderNumber);

                    if (
                        order != null &&
                        Math.Abs(payment.Amount.Value - order.Sum.ConvertCurrency(order.OrderCurrency, PaymentCurrency ?? order.OrderCurrency)) < 1)
                    {
                        OrderService.PayOrder(order.OrderID, true);
                        OrderService.AddUpdateOrderAdditionalData(
                            order.OrderID, 
                            KeyNamePaymentIdInOrderAdditionalData,
                            payment.Id);
                        ClosingReceiptService.SaveOrderState(order);
                    }
                }
            }

            return "";
        }

        private string ProcessResponseByApiOrder(HttpContext context)
        {
            Order order;
            if (context.Request["c"].IsNullOrEmpty() ||
                (order = OrderService.GetOrderByCode(context.Request["c"])) == null)
            {
                return null;
            }

            return order.Payed 
                ? NotificationMessahges.SuccessfullPayment(order.Number)
                : null;
        }

        #endregion

        #region Widget

        public override string ProcessJavascript(Order order)
        {
            var tax = TaxId.HasValue ? TaxService.GetTax(TaxId.Value) : null;
            var service = new YandexKassaApiService(ShopId, SecretKey);
            var confirmation = new CreatePaymentConfirmationEmbedded();
            var payment = SendReceiptData
                ? service.CreatePaymentWithReceipt(order, YaPaymentType, GetOrderDescription(order.Number), false, PaymentCurrency, tax, confirmation, TaxSystemCode, sendMeasure: TypeFfd == EnTypeFfd.From1_2)
                : service.CreatePayment(order, YaPaymentType, GetOrderDescription(order.Number), false, PaymentCurrency, confirmation);

            if (payment == null)
                return "";

            var script = $@"<script type='text/javascript' src='{LinkService.PaymentMethod.Yandex.Script}'></script>
                <script type='text/javascript'>
                    var yooMoneyRenderTimer;
                    function yooMoneyRenderForm () {{
                        document.getElementById('yooMoney-loading').classList.remove('ng-hide');
                        if (yooMoneyRenderTimer != null) {{
                            clearTimeout(yooMoneyRenderTimer);
                        }}
                        if (typeof(window.YooMoneyCheckoutWidget) == 'undefined') {{
                            yooMoneyRenderTimer = setTimeout(function() {{
                                yooMoneyRenderForm();
                            }}, 100);
                        }} else {{
                            const yooMoneyCheckout = new window.YooMoneyCheckoutWidget({{
                                confirmation_token: '{((PaymentConfirmationEmbedded)payment.Confirmation).ConfirmationToken}',
                                return_url: '{SuccessUrl}?orderNum={order.Number}',
                                error_callback(error) {{
                                    console.log('yooMoney: ' + error);
                                }}
                            }});
                            yooMoneyCheckout.render('yooMoney-payment-form').then(function () {{
                                document.getElementById('yooMoney-loading').classList.add('ng-hide');
                            }});
                        }}
                    }};
                    yooMoneyRenderForm();
                </script>
                <style type=""text/css"">.btn--pay {{ display: none!important; }}</style>
                <div class=""flex center-xs text-center m-lg"" id=""yooMoney-loading"">
                    <span class=""icon-spinner-before icon-animate-spin-before h3"">  {LocalizationService.GetResource("Core.Payment.YandexKassa.Loading")}</span>
                </div>                                
                <div id=""yooMoney-payment-form""></div>";

            return script;
        }

        private string ProcessResponseByOrder(HttpContext context)
        {
            Order order;
            if (context.Request["orderNum"].IsNullOrEmpty() || (order = OrderService.GetOrderByNumber(context.Request["orderNum"])) == null)
                return NotificationMessahges.InvalidRequestData;

            var service = new YandexKassaApiService(ShopId, SecretKey);
            var payment = service.GetPaymentByOrder(order.OrderID);
            if (payment == null)
                return null;

            if (payment.Status == "succeeded")
            {
                if (Math.Abs(payment.Amount.Value - order.Sum.ConvertCurrency(order.OrderCurrency, PaymentCurrency ?? order.OrderCurrency)) < 1)
                {
                    OrderService.PayOrder(order.OrderID, true);
                    OrderService.AddUpdateOrderAdditionalData(
                        order.OrderID, 
                        KeyNamePaymentIdInOrderAdditionalData,
                        payment.Id);
                    ClosingReceiptService.SaveOrderState(order);
                }
                return NotificationMessahges.SuccessfullPayment(order.Number);
            }

            var msg = payment != null && payment.CancellationDetails != null ? payment.CancellationDetails.GetErrorMessage() : null;
            
            return NotificationMessahges.Fail + (msg.IsNotEmpty() ? ": " + msg : null);
        }

        #endregion
        
        public enum EnTypeFfd
        {
            Less1_2 = 0,
            From1_2 = 1
        }
    }
}