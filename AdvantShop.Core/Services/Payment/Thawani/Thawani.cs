using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Core.Services.Payment.Thawani.Api;
using AdvantShop.Orders;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AdvantShop.Payment
{
    [PaymentKey("Thawani")]
    public class Thawani : PaymentMethod
    {
        public override bool CurrencyAllAvailable => false;
        public override string[] CurrencyIso3Available => new [] {"OMR"};

        public override ProcessType ProcessType
        {
            get { return ProcessType.ServerRequest; }
        }

        public override NotificationType NotificationType
        {
            get { return NotificationType.Handler; }
        }

        public override UrlStatus ShowUrls
        {
            get { return UrlStatus.NotificationUrl; }
        }
        
        public string SecretKey { get; set; }
        public string PublishableKey { get; set; }
        public bool TestMode => true;

        public override Dictionary<string, string> Parameters
        {
            get
            {
                return new Dictionary<string, string>
                {
                    {ThawaniTemplate.SecretKey, SecretKey},
                    {ThawaniTemplate.PublishableKey, PublishableKey},
                };
            }
            set
            {
                SecretKey = value.ElementOrDefault(ThawaniTemplate.SecretKey);
                PublishableKey = value.ElementOrDefault(ThawaniTemplate.PublishableKey);
            }
        }

        public override string ProcessServerRequest(Order order)
        {
            var service = new ThawaniApiService(SecretKey, TestMode);

            var session = new CreateSession()
            {
                ClientReferenceId = $"{order.OrderID}_{DateTime.Now.ToUnixTime()}",
                Mode = EnModeOfCreateSession.Payment,
                SuccessUrl = SuccessUrl,
                CancelUrl = CancelUrl,
                Metadata = new Dictionary<string, string>()
                {
                    {"Order ID", order.OrderID.ToString()},
                }
            };
            session.Products = order
                              .GetOrderItemsForFiscal(PaymentCurrency, toIntegerAmount: true)
                              .Select(item => new Product
                               {
                                   Name = item.Name,
                                   Quantity = (int)item.Amount,
                                   UnitAmount = (int)Math.Round(item.Price * 1000, 0),
                               })
                              .ToList();
            
            if (session.Products != null && order.OrderCertificates != null && order.OrderCertificates.Count > 0)
            {
                session.Products.AddRange(
                    order.OrderCertificates
                         .ConvertCurrency(order.OrderCurrency, PaymentCurrency)
                         .Select(x => new Product()
                          {
                              Name = LocalizationService.GetResource("Core.Payment.Receipt.GiftCertificateName"),
                              Quantity = 1,
                              UnitAmount = (int)Math.Round(x.Sum * 1000, 0),
                          })
                    );
            }
   
            var orderShippingCostWithDiscount = 
                order.ShippingCostWithDiscount
                     .ConvertCurrency(order.OrderCurrency, PaymentCurrency);
            if (orderShippingCostWithDiscount > 0 && session.Products != null)
            {
                session.Products.Add(
                    new Product()
                    {
                        Name = LocalizationService.GetResource("Core.Payment.Receipt.ShippingName"),
                        Quantity = 1,
                        UnitAmount = (int)Math.Round(orderShippingCostWithDiscount * 1000, 0),
                    });
            }
            
            var response = service.CreateSession(session);

            if (response?.Success == true)
            {
                var returnUrl =
                    TestMode
                    ? LinkService.PaymentMethod.Thawani.SandboxReturnUrl
                    : LinkService.PaymentMethod.Thawani.BaseReturnUrl;
                return $"{returnUrl}/{response.Data.SessionId}?key={PublishableKey}";
            }

            return "";
        }

        public override string ProcessResponse(HttpContext context)
        {
            string bodyPost = null;

            context.Request.InputStream.Seek(0, SeekOrigin.Begin);
            bodyPost = (new StreamReader(context.Request.InputStream)).ReadToEnd();

            if (string.IsNullOrEmpty(bodyPost)) 
                return NotificationMessahges.InvalidRequestData;
            
            var timestamp = context.Request.Headers["thawani-timestamp"];
            var signature = context.Request.Headers["thawani-signature"];
            
            if (timestamp.IsNullOrEmpty()
                || signature.IsNullOrEmpty())
                return NotificationMessahges.InvalidRequestData;

            if (!string.Equals(
                    $"{bodyPost}-{timestamp}".HmacSha256(SecretKey),
                    signature,
                    StringComparison.OrdinalIgnoreCase))
                return string.Empty;
            
            var jToken = JsonConvert.DeserializeObject<JToken>(bodyPost);
            if (jToken == null
                || jToken.Type != JTokenType.Object
                || !string.Equals(jToken["event_type"]?.ToString(), "checkout.completed",
                    StringComparison.OrdinalIgnoreCase)
                || jToken["data"] == null
                || jToken["data"].Type != JTokenType.Object)
                return string.Empty;
            
            var service = new ThawaniApiService(SecretKey, TestMode);
            var jsonSerializer = JsonSerializer.Create(service.DeserializationSettings);
            var checkoutModel = jToken["data"].ToObject<CheckoutModel>(jsonSerializer);

            if (checkoutModel == null
                || checkoutModel.PaymentStatus != EnPaymentStatus.Paid) 
                return string.Empty;
            
            var orderId = checkoutModel.ClientReferenceId?.Split('_')[0].TryParseInt(true);
            var order =
                orderId.HasValue
                    ? OrderService.GetOrder(orderId.Value)
                    : null;
            if (order == null)
                return string.Empty;
            
            var orderSumInPaymentCurrency = (int)(order.Sum.ConvertCurrency(order.OrderCurrency, PaymentCurrency ?? order.OrderCurrency) * 1000);
            if (Math.Abs(checkoutModel.TotalAmount - orderSumInPaymentCurrency) < 100) 
                // разница 100 байза (1 байз = 1/1000 оманского риала)
                // или 0.1 оманского риала
            {
                OrderService.PayOrder(order.OrderID, true,
                    changedBy: new OrderChangedBy("Thawani"));

                return NotificationMessahges.SuccessfullPayment(order.Number);
            }

            return string.Empty;
        }
    }
}