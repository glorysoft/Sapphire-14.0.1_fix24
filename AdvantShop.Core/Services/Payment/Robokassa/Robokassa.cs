//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Web;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Core.Services.Payment.Robokassa;
using AdvantShop.Core.Services.Taxes;
using AdvantShop.Localization;
using AdvantShop.Orders;
using AdvantShop.Saas;
using AdvantShop.Taxes;

namespace AdvantShop.Payment
{
    /// <summary>
    /// Summary description for Robokassa
    /// </summary>
    [PaymentKey("Robokassa")]
    public partial class Robokassa : PaymentMethod, ICreditPaymentMethod
    {
        public const string ProtocolForm = "Form";
        public const string ProtocolIframe = "Iframe";

        public override ProcessType ProcessType
        {
            get
            {
                switch (Protocol)
                {
                    case ProtocolForm:
                        return ProcessType.FormPost;
                    case ProtocolIframe:
                        return ProcessType.Javascript;
                    default:
                        return ProcessType.FormPost;
                }
            }
        }

        public override NotificationType NotificationType
        {
            get { return NotificationType.Handler; }
        }
        public override UrlStatus ShowUrls
        {
            get { return UrlStatus.CancelUrl | UrlStatus.ReturnUrl | UrlStatus.NotificationUrl; }
        }
        public string MerchantLogin { get; set; }
        public string Password { get; set; }
        public string PasswordNotify { get; set; }
        public List<string> CurrencyLabels { get; set; }
        public bool SendReceiptData { get; set; }
        public bool IsTest { get; set; }
        public float Fee { get; set; }
        public string GatewayCountry { get; set; }
        public string Protocol { get; set; }

        #region CreditPayment

        public float MinimumPrice { get; set; }
        public float? MaximumPrice { get; set; }
        public EnTypePresentationOfCreditInformation TypePresentationOfCreditInformation =>
            EnTypePresentationOfCreditInformation.FirstPayment;
        public float FirstPayment { get; set; }
        public bool ActiveCreditPayment
        {
            get
            {
                return CurrencyLabels?.Any(currencyLabel => currencyLabel.StartsWith("AlwaysYes")
                       || currencyLabel.StartsWith("OTP")
                       || currencyLabel.StartsWith("Podeli")) is true;
            }
        }
        public bool ShowCreditButtonInProductCard => true;
        public string CreditButtonTextInProductCard => null;

        #endregion

        public override Dictionary<string, string> Parameters
        {
            get
            {
                return new Dictionary<string, string>
                           {
                               {RobokassaTemplate.MerchantLogin, MerchantLogin},
                               {RobokassaTemplate.CurrencyLabels, CurrencyLabels == null ? string.Empty : string.Join(",", CurrencyLabels)},
                               {RobokassaTemplate.Password, Password},
                               {RobokassaTemplate.PasswordNotify, PasswordNotify},
                               {RobokassaTemplate.SendReceiptData, SendReceiptData.ToString()},
                               {RobokassaTemplate.IsTest, IsTest.ToString()},
                               {RobokassaTemplate.Fee, Fee.ToInvariantString()},
                               {RobokassaTemplate.GatewayCountry, GatewayCountry},
                               {RobokassaTemplate.MinimumPrice, MinimumPrice.ToInvariantString()},
                               {RobokassaTemplate.MaximumPrice, MaximumPrice?.ToInvariantString()},
                               {RobokassaTemplate.FirstPayment, FirstPayment.ToInvariantString()},
                               {RobokassaTemplate.Protocol, Protocol},
                           };
            }
            set
            {
                if (value.ContainsKey(RobokassaTemplate.MerchantLogin))
                    MerchantLogin = value[RobokassaTemplate.MerchantLogin];
                Password = value.ElementOrDefault(RobokassaTemplate.Password);
                PasswordNotify = value.ElementOrDefault(RobokassaTemplate.PasswordNotify);
                CurrencyLabels = value.ContainsKey(RobokassaTemplate.CurrencyLabels)
                                    ? value[RobokassaTemplate.CurrencyLabels]?.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).ToList()
                                    : null;
                SendReceiptData = value.ElementOrDefault(RobokassaTemplate.SendReceiptData).TryParseBool();
                IsTest = value.ElementOrDefault(RobokassaTemplate.IsTest).TryParseBool();
                Fee = value.ElementOrDefault(RobokassaTemplate.Fee).TryParseFloat();
                GatewayCountry = value.ElementOrDefault(RobokassaTemplate.GatewayCountry);
                MinimumPrice = value.ElementOrDefault(RobokassaTemplate.MinimumPrice).TryParseFloat();
                MaximumPrice = value.ElementOrDefault(RobokassaTemplate.MaximumPrice).TryParseFloat(true);
                FirstPayment = value.ElementOrDefault(RobokassaTemplate.FirstPayment).TryParseFloat();
                Protocol = value.ElementOrDefault(RobokassaTemplate.Protocol, ProtocolForm);
            }
        }

        public override PaymentForm GetPaymentForm(Order order)
        {
            var paymentCurrency = PaymentCurrency ?? order.OrderCurrency;
            
            var sum = order.Sum.ConvertCurrency(order.OrderCurrency, paymentCurrency).SubtractFee(Fee);

            bool isRobomarket = SaasDataService.IsSaasEnabled && SaasDataService.CurrentSaasData?.Name?.ToLower().Contains("robomarket") == true;

            var receipt = GetReceipt(order, paymentCurrency);
            var receiptString = receipt != null ? HttpUtility.UrlEncode(Newtonsoft.Json.JsonConvert.SerializeObject(receipt)) : null;

            var handler = new PaymentForm
            {
                FormName = "_xclick",
                Method = FormMethod.POST,
                Url = GetGatewayUrl(GatewayCountry),
                InputValues = new NameValueCollection
                {
                    {"MrchLogin", MerchantLogin},
                    {"OutSum", sum.ToInvariantString()},
                    {"InvId", order.OrderID.ToString()},
                    {"Desc", GetOrderDescription(order.Number)},
                    {"IsTest", IsTest ? "1" : "0"},
                    {"Culture", Culture.Language == Culture.SupportLanguage.Russian ? "ru" : "en"},
                    {"ResultUrl2", NotificationUrl},
                    {"SuccessUrl2", SuccessUrl},
                    {"SuccessUrl2Method", "POST" },
                    {"FailUrl2", CancelUrl},
                    {"FailUrl2Method", "POST"},
                    {"shp_partner", "API_Advantshop"},


                    {
                        "SignatureValue",
                        (MerchantLogin + ":"
                                       + sum.ToInvariantString() + ":" 
                                       + order.OrderID + ":" 
                                       + (receiptString.IsNotEmpty() ? receiptString + ":" : string.Empty) 
                                       + NotificationUrl + ":" 
                                       + SuccessUrl + ":" 
                                       + "POST" + ":" 
                                       + CancelUrl + ":" 
                                       + "POST" + ":" 
                                       + Password + ":" 
                                       + "shp_partner=API_Advantshop"
                                       + (isRobomarket ? ":shp_robomarket=true" : "")).Md5()
                    },
                    {"receipt", receiptString }
                }
            };

            if (isRobomarket)
            {
                handler.InputValues.Add("shp_robomarket", "true");
            }


            if (order.OrderCustomer?.Email != null)
                handler.InputValues.Add("Email", order.OrderCustomer.Email);

            CurrencyLabels?.ForEach(x => handler.InputValues.Add("PaymentMethods", x));

            return handler;
        }

        #region Widget

        public override string ProcessJavascript(Order order)
        {
            return $"<script type=\"text/javascript\" src=\"{LinkService.PaymentMethod.Robokassa.Ru}/Merchant/bundle/robokassa_iframe.js\"></script>";
        }

        public override string ProcessJavascriptButton(Order order)
        {
            var paymentCurrency = PaymentCurrency ?? order.OrderCurrency;
            var sum = order.Sum.ConvertCurrency(order.OrderCurrency, paymentCurrency).SubtractFee(Fee);
            bool isRobomarket = SaasDataService.IsSaasEnabled && SaasDataService.CurrentSaasData?.Name?.ToLower().Contains("robomarket") == true;
            var receipt = GetReceipt(order, paymentCurrency);
            var receiptString = receipt != null ? HttpUtility.UrlEncode(Newtonsoft.Json.JsonConvert.SerializeObject(receipt)) : null;
            var signature = string.Format("{0}:{1}:{2}:{3}{4}:shp_partner=API_Advantshop{5}",
                MerchantLogin,
                sum.ToInvariantString(),
                order.OrderID,
                receiptString.IsNotEmpty() 
                    ? receiptString + ":" : 
                    string.Empty,
                Password,
                isRobomarket ? ":shp_robomarket=true" : string.Empty).Md5();

            return string.Format(@"Robokassa.{8}({{
                MerchantLogin: '{0}',
                OutSum: '{1}',
                InvId: {2},
                shp_partner: 'API_Advantshop',
                {3}
                Culture: '{4}',
                Encoding: 'utf-8',
                {5}
                {6}
                SignatureValue: '{7}',
                IsTest: {9}}})",
                MerchantLogin,
                sum,
                order.OrderID,
                isRobomarket ? "shp_robomarket:'true'," : "",
                Culture.Language == Culture.SupportLanguage.Russian ? "ru" : "en",
                CurrencyLabels?.Count > 0 ? $"Settings: JSON.stringify({{PaymentMethods:['{string.Join("','", CurrencyLabels)}'], Mode:'modal'}})," : string.Empty,
                receiptString.IsNotEmpty() ? $"Receipt: '{receiptString}'," : string.Empty,
                signature,
                CurrencyLabels?.Count > 0 ? "Render" : "StartPayment",
                IsTest.ToInt());
        }

        #endregion

        private Receipt GetReceipt(Order order, Repository.Currencies.Currency paymentCurrency,
            ePaymentMethodType? dominatePaymentMethodType = null, bool marking = false)
        {
            if (!SendReceiptData)
                return null;
            
            var tax = TaxId.HasValue ? TaxService.GetTax(TaxId.Value) : null;

            var receipt = new Receipt();

            if (marking)
            {
                var gs = ((char)29).ToString();
                receipt.items = new List<Item>();

                var cacheProducts = new Dictionary<int, Product>();
                var cacheMarkingItems = new Dictionary<int, List<MarkingOrderItem>>();

                foreach (var item in order.GetOrderItemsForFiscal(paymentCurrency))
                {
                    if (item.ProductID.HasValue
                        && !cacheProducts.ContainsKey(item.ProductID.Value))
                        cacheProducts.Add(item.ProductID.Value, ProductService.GetProduct(item.ProductID.Value));

                    var product = item.ProductID.HasValue
                        ? cacheProducts[item.ProductID.Value]
                        : null;

                    var receiptItem = CreateReceiptItemByOrderItem(item);

                    if (item.IsMarkingRequired
                        || product?.IsMarkingRequired == true)
                    {
                        if (!cacheMarkingItems.ContainsKey(item.OrderItemID))
                            cacheMarkingItems.Add(item.OrderItemID,
                                MarkingOrderItemService.GetMarkingItems(item.OrderItemID));

                        var markingItems = cacheMarkingItems[item.OrderItemID];
                        var amountMarking = (int)Math.Ceiling(item.Amount);
                        if (markingItems.Count(x => !string.IsNullOrWhiteSpace(x.Code)) == amountMarking
                            && item.Amount > 0)
                        {
                            for (var i = 0; i < amountMarking; i++)
                            {
                                var markingReceiptItem = receiptItem.DeepCloneJson();
                                markingReceiptItem.quantity = i + 1 >= amountMarking ? receiptItem.quantity - i : 1;
                                markingReceiptItem.sum = (float)Math.Round(item.Price * markingReceiptItem.quantity, 2);
                                markingReceiptItem.nomenclature_code = markingItems[0].Code;
                                markingItems.RemoveAt(0);
                                receipt.items.Add(markingReceiptItem);
                            }
                        }
                        else
                        {
                            throw new BlException(
                                $"Robokassa CreateReceipt: не хватает маркировки для позиции (OrderItemID: {item.OrderItemID}, заказ: {order.Number})");
                        }
                    }
                    else
                        receipt.items.Add(receiptItem);
                }
            }
            else
                receipt.items = order
                    .GetOrderItemsForFiscal(paymentCurrency)
                    .Select(CreateReceiptItemByOrderItem)
                    .ToList();

            if (order.OrderCertificates != null && order.OrderCertificates.Count > 0)
            {
                var certTax = TaxService.GetCertificateTax();
                receipt.items.AddRange(order.OrderCertificates
                    .ConvertCurrency(order.OrderCurrency, paymentCurrency)
                    .Select(x =>
                    new Item
                    {
                        name = $"{LocalizationService.GetResource("Core.Payment.Receipt.GiftCertificateName")} {x.CertificateCode}",
                        sum = x.Sum,
                        quantity = 1,
                        tax = GetVatType(tax?.TaxType ?? certTax?.TaxType, tax?.Rate ?? certTax?.Rate ?? 0f, dominatePaymentMethodType ?? SettingsCertificates.PaymentMethodType),
                        payment_method = GetPaymentMethodType(dominatePaymentMethodType ?? SettingsCertificates.PaymentMethodType),
                        payment_object = SettingsCertificates.PaymentSubjectType.ToString()
                    }));
            }

            var orderShippingCostWithDiscount =
                order.ShippingCostWithDiscount
                    .ConvertCurrency(order.OrderCurrency, paymentCurrency);
            if (orderShippingCostWithDiscount > 0)
            {
                receipt.items.Add(new Item
                {
                    name = LocalizationService.GetResource("Core.Payment.Receipt.ShippingName"),
                    sum = orderShippingCostWithDiscount,
                    quantity = 1,
                    tax = GetVatType(tax?.TaxType ?? order.ShippingTaxType, tax?.Rate, dominatePaymentMethodType ?? order.ShippingPaymentMethodType),
                    payment_method = GetPaymentMethodType(dominatePaymentMethodType ?? order.ShippingPaymentMethodType),
                    payment_object = order.ShippingPaymentSubjectType.ToString()
                });
            }

            return receipt;

            Item CreateReceiptItemByOrderItem(OrderItem item)
            {
                return new Item()
                {
                    name = item.Name.Reduce(64),
                    sum = (float)Math.Round(item.Price * item.Amount, 2),
                    quantity = item.Amount,
                    tax = GetVatType(tax?.TaxType ?? item.TaxType, tax?.Rate ?? item.TaxRate, dominatePaymentMethodType ?? item.PaymentMethodType),
                    payment_method = GetPaymentMethodType(dominatePaymentMethodType ?? item.PaymentMethodType),
                    payment_object = item.PaymentSubjectType.ToString()
                };
            }
        }

        private string GetGatewayUrl(string gatewayCountry)
        {
            switch (gatewayCountry)
            {
                case "ru":
                    return $"{LinkService.PaymentMethod.Robokassa.Ru}/Merchant/Index.aspx";
                
                case "kz":
                    return $"{LinkService.PaymentMethod.Robokassa.Kz}/Merchant/Index.aspx";
            }
            return $"{LinkService.PaymentMethod.Robokassa.Ru}/Merchant/Index.aspx";
        }

        public override string ProcessResponse(HttpContext context)
        {
            if (context.Request.Url.AbsolutePath.Contains("paymentnotification"))
                return ProcessResponseNotify(context);
            return ProcessResponseReturn(context);
        }

        private string ProcessResponseReturn(HttpContext context)
        {
            var req = context.Request;
            int orderId = 0;

            if (int.TryParse(req["InvId"], out orderId))
            {
                if (CheckFields(req))
                {

                    Order order = OrderService.GetOrder(orderId);
                    if (order != null)
                    {
                        OrderService.PayOrder(orderId, true, changedBy: new OrderChangedBy("Подтверждение оплаты платежной системой"));
                        ClosingReceiptService.SaveOrderState(order);
                        return NotificationMessahges.SuccessfullPayment(orderId.ToString());
                    }
                }
                return NotificationMessahges.InvalidRequestData;
            }
            return string.Empty;
        }

        private bool CheckFields(HttpRequest req)
        {
            if (string.IsNullOrEmpty(req["OutSum"]) || string.IsNullOrEmpty(req["InvId"]) || string.IsNullOrEmpty(req["Culture"]) ||
                string.IsNullOrEmpty(req["SignatureValue"]))
                return false;
            if (req["SignatureValue"].ToLower() !=
                (req["OutSum"].Trim() + ":" + req["InvId"] + ":" + Password).Md5(false))
                return false;
            return true;
        }

        private string ProcessResponseNotify(HttpContext context)
        {
            var request = context.Request;
            if (string.Equals(request.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase)
                && request.ContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase))
            {
                context.Request.InputStream.Seek(0, SeekOrigin.Begin);
                var bodyString = new StreamReader(context.Request.InputStream).ReadToEnd();
                if (!string.IsNullOrWhiteSpace(bodyString))
                {
                    var jwsItems = bodyString.Split('.');
                    if (jwsItems.Length == 3)
                    {
                        var (payload, validSignature) = RobokassaJwsPayloadHelper.FromJwsString(bodyString);

                        if (validSignature && int.TryParse(payload.InvId, out var payloadOrderId))
                        {
                            var order = OrderService.GetOrder(payloadOrderId);
                            if (order != null)
                            {
                                OrderService.PayOrder(payloadOrderId, true);
                                ClosingReceiptService.SaveOrderState(order);
                                return $"OK{payload.InvId}";
                            }
                        }
                    }
                }

                return NotificationMessahges.InvalidRequestData;
            }

            if (CheckFieldsExt(request) && int.TryParse(request["InvId"], out var orderId))
            {
                var order = OrderService.GetOrder(orderId);
                if (order != null)
                {
                    OrderService.PayOrder(orderId, true);
                    ClosingReceiptService.SaveOrderState(order);
                    return $"OK{request["InvId"]}";
                }
            }
            return NotificationMessahges.InvalidRequestData;
        }

        private bool CheckFieldsExt(HttpRequest req)
        {
            if (string.IsNullOrEmpty(req["OutSum"]) || string.IsNullOrEmpty(req["InvId"]) || string.IsNullOrEmpty(req["SignatureValue"]))
                return false;
            if (req["SignatureValue"].ToLower() !=
                (req["OutSum"].Trim() + ":" + req["InvId"] + ":" + PasswordNotify + 
                (string.IsNullOrEmpty(req["shp_partner"]) ? "" : ":" + "shp_partner=API_Advantshop") +
                (string.IsNullOrEmpty(req["shp_robomarket"]) ? "" : ":" + "shp_robomarket=true")
                ).Md5(false))
                return false;
            return true;
        }

        public float? GetFirstPayment(float finalPrice)
        {
            return finalPrice * FirstPayment / 100;
        }

        public (float AmountPyament, int NumberOfPayments) GetAmountAndNumberOfPayments(float finalPrice) => default;
        
        #region Receipt
        
        /*
        none – без НДС;
        vat0 – НДС по ставке 0%;
        vat5 – НДС по ставке 6%;
        vat7 – НДС по ставке 7%;
        vat10 – НДС чека по ставке 10%;
        vat18 – НДС чека по ставке 18%;
        vat20 – НДС чека по ставке 20%;
        vat22 – НДС чека по ставке 22%;
        vat105 – НДС чека по расчетной ставке 5/105;
        vat107 – НДС чека по расчетной ставке 7/107;
        vat110 – НДС чека по расчетной ставке 10/110;
        vat118 – НДС чека по расчетной ставке 18/118.
        vat120 – НДС чека по расчетной ставке 20/120.
        vat122 – НДС чека по расчетной ставке 22/122.
        */
        private string GetVatType(TaxType? taxType, float? taxRate, ePaymentMethodType paymentMethodType)
        {
            if (!taxType.HasValue || taxType.Value == TaxType.VatWithout)
                return "none";

            if (taxType.Value == TaxType.Vat0)
                return "vat0";

            if (taxType.Value == TaxType.Vat10)
            {
                if (Configuration.SettingsCheckout.TaxTypeByPaymentMethodType &&
                    (paymentMethodType == ePaymentMethodType.full_prepayment ||
                     paymentMethodType == ePaymentMethodType.partial_prepayment ||
                     paymentMethodType == ePaymentMethodType.advance))
                    return "vat110";
                else
                    return "vat10";
            }

            if (taxType.Value == TaxType.Vat5)
            {
                if (Configuration.SettingsCheckout.TaxTypeByPaymentMethodType &&
                    (paymentMethodType == ePaymentMethodType.full_prepayment ||
                     paymentMethodType == ePaymentMethodType.partial_prepayment ||
                     paymentMethodType == ePaymentMethodType.advance))
                    return "vat105";
                else
                    return "vat5";
            }

            if (taxType.Value == TaxType.Vat7)
            {
                if (Configuration.SettingsCheckout.TaxTypeByPaymentMethodType &&
                    (paymentMethodType == ePaymentMethodType.full_prepayment ||
                     paymentMethodType == ePaymentMethodType.partial_prepayment ||
                     paymentMethodType == ePaymentMethodType.advance))
                    return "vat107";
                else
                    return "vat7";
            }

            if (taxType.Value == TaxType.Vat22)
            {
                if (Configuration.SettingsCheckout.TaxTypeByPaymentMethodType &&
                    (paymentMethodType == ePaymentMethodType.full_prepayment ||
                     paymentMethodType == ePaymentMethodType.partial_prepayment ||
                     paymentMethodType == ePaymentMethodType.advance))
                    return "vat122";
                else
                    return "vat22";
            }

            if (taxType.Value == TaxType.Other &&
                taxRate.HasValue)
                return "vat" + taxRate;

            return "none";
        }

        private string GetPaymentMethodType(ePaymentMethodType paymentMethodType)
        {
            switch (paymentMethodType)
            {
                case ePaymentMethodType.full_prepayment:
                    return "full_prepayment";
                case ePaymentMethodType.partial_prepayment:
                    return "prepayment"; // из-за этого значения нельзя enum.Tostring();
                case ePaymentMethodType.advance:
                    return "advance";
                case ePaymentMethodType.full_payment:
                    return "full_payment";
                case ePaymentMethodType.partial_payment:
                    return "partial_payment";
                case ePaymentMethodType.credit:
                    return "credit";
                case ePaymentMethodType.credit_payment:
                    return "credit_payment";
                default:
                    throw new NotImplementedException(paymentMethodType.ToString() + " not implemented in Robokassa");
            }
        }

        #endregion
    }
}