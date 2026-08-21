//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Diagnostics;
using AdvantShop.Orders;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Helpers;
using AdvantShop.Taxes;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using AdvantShop.Core.Services.Taxes;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Repository.Currencies;

namespace AdvantShop.Core.Services.Payment.Alfabank
{
    // https://pay.alfabank.ru/ecommerce/instructions/merchantManual/pages/fz_index.html
    public class AlfabankService
    {
        // для ReturnUrl
        public const string ReturnUrlParamNameMerchantOrder = "merchantorderid";

        private readonly string _gatewayUrl = LinkService.PaymentMethod.Alfabank.Ru + "/";

        private readonly string _userName;
        private readonly string _password;
        private readonly string _merchantLogin;
        private readonly bool _useFfd12;

        public AlfabankService(string gatewayUrl, string userName, string password, string merchantLogin, bool useFfd12)
        {
            if (gatewayUrl.IsNotEmpty())
                _gatewayUrl = gatewayUrl;
            _userName = userName;
            _password = password;
            _merchantLogin = merchantLogin;
            _useFfd12 = useFfd12;
        }

        /// <summary>
        /// Регистрация заказа
        /// </summary>
        public AlfabankRegisterResponse Register(Order order, string description, bool sendReceiptData,
                                                 string taxation, Currency paymentCurrency, string returnUrl, 
                                                 string failUrl, string notificationUrl, TaxElement tax)
        {
            paymentCurrency = paymentCurrency ?? order.OrderCurrency;
            var receipt = sendReceiptData
                ? new Receipt()
                {
                    CustomerDetails = ValidationHelper.IsValidEmail(order.OrderCustomer.Email)
                        ? new CustomerDetails { Email = order.OrderCustomer.Email }
                        : null,
                    CartItems = new CartItems
                    {
                        Items = GetReceiptItems(order, paymentCurrency, tax),
                    }
                }
                : null;

            long sum = 0;

            if (receipt != null && receipt.CartItems != null && receipt.CartItems.Items != null)
                foreach (var item in receipt.CartItems.Items)
                    sum += item.ItemAmount;
            else
                sum = (long)Math.Round(Math.Round(order.Sum.ConvertCurrency(order.OrderCurrency, paymentCurrency), 2) * 100);

            int retriesNum = 0;
            string orderStrId;
            bool success = false;
            AlfabankRegisterResponse response;

            do
            {
                // если заказ уже есть в альфабанке, но был изменен на стороне магазина, подменяем id на id_номерпопытки
                orderStrId = retriesNum > 0
                    ? $"{order.Number}_{DateTime.Now.ToUnixTime()}"
                    : order.Number.ToString();

                var data = new Dictionary<string, string>()
                {
                    {"userName", _userName},
                    {"password", _password},
                    {"orderNumber", orderStrId},
                    {"amount", sum.ToString()},    // Сумма платежа в копейках (или центах)
                    //{"currency", ""}, // ISO 4217
                    {"returnUrl", $"{returnUrl}{(returnUrl.Contains("?") ? "&" : "?")}{ReturnUrlParamNameMerchantOrder}={HttpUtility.UrlEncode(order.Number)}"
                    },
                    {"failUrl", failUrl},
                    {"dynamicCallbackUrl", notificationUrl},
                    //{"pageView", "DESKTOP"}, // "MOBILE"
                    {"clientId", order.OrderCustomer.CustomerID.ToString()},
                    //{"bindingId", "" }                // Идентификатор связки, созданной ранее. Может использоваться, только если у магазина есть разрешение на работу со связками. Если этот параметр передаётся в данном запросе, то это означает: 1. Данный заказ может быть оплачен только с помощью связки; 2. Плательщик будет перенаправлен на платёжную страницу, где требуется только ввод CVC.
                };

                if (!string.IsNullOrEmpty(_merchantLogin))
                    data.Add("merchantLogin", _merchantLogin);  // Чтобы зарегистрировать заказ от имени дочернего мерчанта, укажите его логин в этом параметре.

                // ФЗ 54
                if (receipt != null)
                {
                    data.Add("taxSystem", taxation);
                    data.Add("orderBundle",
                        JsonConvert.SerializeObject(receipt,
                            new JsonSerializerSettings()
                            {
                                ContractResolver = new CamelCasePropertyNamesContractResolver()
                            }));
                }


                response = MakeRequest<AlfabankRegisterResponse>("register.do", data);

                if (response == null)
                    return null;

                success = response.ErrorCode == 0;

                if (!success)
                {
                    Debug.Log.Info(string.Format("AlfabankService Register. code: {0} error: {1}, obj: {2}",
                                                    response.ErrorCode, response.ErrorMessage, JsonConvert.SerializeObject(response)));
                }
                retriesNum++;
            } while (response.ErrorCode == 1 && retriesNum < 3);

            return success ? response : null;
        }

        private List<Item> GetReceiptItems(Order order, Currency paymentCurrency, TaxElement tax,
            ePaymentMethodType? dominatePaymentMethodType = null, bool marking = false)
        {
            int index = 1;
            List<Item> items;
            if (marking)
            {
                var gs = ((char) 29).ToString();
                items = new List<Item>();

                
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
                            cacheMarkingItems.Add(item.OrderItemID, MarkingOrderItemService.GetMarkingItems(item.OrderItemID));

                        var markingItems = cacheMarkingItems[item.OrderItemID];
                        var amountMarking = (int) Math.Ceiling(item.Amount);
                        if (markingItems.Count(x => !string.IsNullOrWhiteSpace(x.Code)) == amountMarking
                            && item.Amount > 0)
                        {
                            for (var i = 0; i < amountMarking; i++)
                            {
                                var markingReceiptItem = receiptItem.DeepCloneJson(TypeNameHandling.All);
                                markingReceiptItem.PositionId = index++;
                                markingReceiptItem.Quantity.Value = i + 1 >= amountMarking ? receiptItem.Quantity.Value - i : 1;
                                markingReceiptItem.ItemAmount = (int)Math.Round(item.Price * markingReceiptItem.Quantity.Value * 100, 0);
                                
                                markingReceiptItem.ItemAttributes.Attributes.Add(
                                    new ItemAttribute()
                                    {
                                        Name = "nomenclature",
                                        Value =
                                            _useFfd12
                                                ? markingItems[0].Code//.Replace(gs, "\\u001d") Newtonsoft.Json сам экранирует именно так
                                                : BitConverter.ToString(Encoding.UTF8.GetBytes(markingItems[0].Code)).Replace("-", " ")
                                    });
                                
                                markingReceiptItem.ItemAttributes.Attributes.Add(
                                    new ItemAttribute()
                                    {
                                        Name = "markQuantity.numerator",
                                        Value = "1"
                                    });
                                markingReceiptItem.ItemAttributes.Attributes.Add(
                                    new ItemAttribute()
                                    {
                                        Name = "markQuantity.denominator",
                                        Value = "1"
                                    });

                                markingItems.RemoveAt(0);
                                items.Add(markingReceiptItem);
                            }
                        }
                        else
                        {
                            throw new BlException(
                                $"AlfabankService CreateReceipt: не хватает маркировки для позиции (OrderItemID: {item.OrderItemID}, заказ: {order.Number})");
                        }
                    }
                    else
                    {
                        receiptItem.PositionId = index++;
                        items.Add(receiptItem);
                    }
                }
            }
            else
                items = order
                    .GetOrderItemsForFiscal(paymentCurrency)
                    .Select(item =>
                    {
                        var receiptItem = CreateReceiptItemByOrderItem(item);
                        receiptItem.PositionId = index++;
                        return receiptItem;
                    })
                    .ToList();

            if (order.OrderCertificates != null && order.OrderCertificates.Count > 0)
            {
                var certTax = TaxService.GetCertificateTax();
                items.AddRange(order.OrderCertificates
                    .ConvertCurrency(order.OrderCurrency, paymentCurrency)
                    .Select(x =>
                        new Item
                        {
                            Name = "Подарочный сертификат",
                            ItemCode = x.CertificateCode,
                            PositionId = index++,
                            ItemAmount = (int)(Math.Round(x.Sum, 2) * 100),
                            ItemPrice = (int)(Math.Round(x.Sum, 2) * 100),
                            Quantity = _useFfd12
                                ? (BaseQuantity)new Quantity<byte?> {Value = 1, Measure = GetMeasure(MeasureType.Piece)}
                                : (BaseQuantity)new Quantity<string>() {Value = 1, Measure = "штук"},
                            Tax = new Tax() { TaxType = GetTaxType(tax?.TaxType ?? certTax?.TaxType, dominatePaymentMethodType ?? SettingsCertificates.PaymentMethodType) },
                            ItemAttributes = new ItemAttributes
                            {
                                Attributes = new List<ItemAttribute>
                                {
                                    new ItemAttribute()
                                    {
                                        Name = "paymentMethod",
                                        Value =((int) (dominatePaymentMethodType ?? SettingsCertificates.PaymentMethodType)).ToString()
                                    },
                                    new ItemAttribute()
                                    {
                                        Name = "paymentObject",
                                        Value =((int)SettingsCertificates.PaymentSubjectType).ToString()
                                    }
                                }
                            }
                            //ItemAttributes = new ItemAttribute() { PaymentMethod = (int)ePaymentMethodType.advance, PaymentObject = (int)ePaymentSubjectType.payment }
                        }));
            }

            var orderShippingCostWithDiscount = 
                order.ShippingCostWithDiscount.ConvertCurrency(order.OrderCurrency, paymentCurrency);
            if (orderShippingCostWithDiscount > 0)
            {
                items.Add(new Item()
                {
                    Name = "Доставка",
                    ItemCode = "Доставка",
                    PositionId = index++,
                    ItemAmount = (int)(Math.Round(orderShippingCostWithDiscount, 2) * 100),
                    ItemPrice = (int)(Math.Round(orderShippingCostWithDiscount, 2) * 100),
                    Quantity = _useFfd12
                        ? (BaseQuantity)new Quantity<byte?> {Value = 1, Measure = GetMeasure(MeasureType.Piece)}
                        : (BaseQuantity)new Quantity<string>() {Value = 1, Measure = "штук"},
                    Tax = new Tax() { TaxType = GetTaxType(tax?.TaxType ?? order.ShippingTaxType, dominatePaymentMethodType ?? order.ShippingPaymentMethodType) },
                    ItemAttributes = new ItemAttributes
                    {
                        Attributes = new List<ItemAttribute>
                        {
                            new ItemAttribute()
                            {
                                Name = "paymentMethod",
                                Value =((int)(dominatePaymentMethodType ?? order.ShippingPaymentMethodType)).ToString()
                            },
                            new ItemAttribute()
                            {
                                Name = "paymentObject",
                                Value =((int)order.ShippingPaymentSubjectType).ToString()
                            }
                        }
                    }
                });
            }

            return items;

            Item CreateReceiptItemByOrderItem(OrderItem item)
            {
                return new Item()
                {
                    Name = item.Name.Length > 100 ? item.Name.Substring(0, 100) : item.Name,
                    ItemCode = item.ArtNo,
                    ItemAmount = (int)Math.Round(item.Price * item.Amount * 100, 0),
                    ItemPrice = (int)Math.Round(item.Price * 100, 0),
                    Quantity = _useFfd12
                        ? (BaseQuantity)new Quantity<byte?>
                        {
                            Value = item.Amount,
                            Measure = GetMeasure(item.MeasureType)
                        }
                        : (BaseQuantity)new Quantity<string>()
                        {
                            Value = item.Amount,
                            Measure = item.Unit.IsNotEmpty()
                                ? item.Unit
                                : "штук"
                        },
                    Tax = new Tax()
                    {
                        TaxType = GetTaxType(tax?.TaxType ?? item.TaxType,
                            dominatePaymentMethodType ?? item.PaymentMethodType)
                    },
                    ItemAttributes = new ItemAttributes
                    {
                        Attributes = new List<ItemAttribute>
                        {
                            new ItemAttribute()
                            {
                                Name = "paymentMethod",
                                Value = ((int)(dominatePaymentMethodType ?? item.PaymentMethodType)).ToString()
                            },
                            new ItemAttribute()
                            {
                                Name = "paymentObject",
                                Value = ((int)item.PaymentSubjectType).ToString()
                            }
                        }
                    }
                };
            }
        }

        /// <summary>
        /// Запрос состояния заказа
        /// </summary>
        public AlfabankOrderStatusResponse GetOrderStatus(string alfaOrderId, string merchantOrderid)
        {
            var data = new Dictionary<string, string>()
            {
                {"userName", _userName},
                {"password", _password},
            };

            if (!string.IsNullOrEmpty(alfaOrderId))
                data.Add("orderId", alfaOrderId);

            if (!string.IsNullOrEmpty(merchantOrderid))
                data.Add("merchantOrderNumber", merchantOrderid);

            var response = MakeRequest<AlfabankOrderStatusResponse>("getOrderStatusExtended.do", data);

            if (response == null)
                return null;

            var success = response.ErrorCode == 0;

            if (!success)
            {
                Debug.Log.Info(string.Format("AlfabankService GetOrderStatus. code: {0} error: {1}, obj: {2}",
                                                response.ErrorCode, response.ErrorMessage, JsonConvert.SerializeObject(response)));
            }

            return response;
        }
        public AlfabankCloseOfdReceiptResponse CloseReceipt(string alfaOrderId, Order order,
                                                 string taxation, Currency paymentCurrency, TaxElement tax)
        {
            paymentCurrency = paymentCurrency ?? order.OrderCurrency;
            var receipt = new Receipt()
            {
                CustomerDetails = ValidationHelper.IsValidEmail(order.OrderCustomer.Email)
                    ? new CustomerDetails { Email = order.OrderCustomer.Email }
                    : null,
                CartItems = new CartItems
                {
                    Items = GetReceiptItems(order, paymentCurrency, tax, ePaymentMethodType.full_payment, marking: true),
                }
            };

            long sum = 0;

            if (receipt.CartItems != null && receipt.CartItems.Items != null)
                foreach (var item in receipt.CartItems.Items)
                    sum += item.ItemAmount;
            else
                sum = (long)Math.Round(Math.Round(order.Sum.ConvertCurrency(order.OrderCurrency, paymentCurrency), 2) * 100);

            var data = new Dictionary<string, string>()
            {
                { "userName", _userName },
                { "password", _password },
                { "mdOrder", alfaOrderId },
                { "amount", sum.ToString() }, // Сумма платежа в копейках (или центах)
                // { "taxSystem", taxation },
                {
                    "orderBundle",
                    JsonConvert.SerializeObject(receipt,
                        new JsonSerializerSettings()
                        {
                            ContractResolver = new CamelCasePropertyNamesContractResolver()
                        })
                },
            };

            if (!string.IsNullOrEmpty(_merchantLogin))
                data.Add("merchantLogin", _merchantLogin); 

            return MakeRequest<AlfabankCloseOfdReceiptResponse>("closeOfdReceipt.do", data);
        }

        #region Private methods

        /*
        0 — без НДС
        1 — НДС по ставке 0%
        2 — НДС по ставке 10%
        4 — НДС по расчетной ставке 10/110
        6 — НДС по ставке 20%
        7 — НДС по расчетной ставке 20/120
        10 — НДС по ставке 5%
        11 — НДС по расчетной ставке 5/105
        12 — НДС по ставке 7%
        13 — НДС по расчетной ставке 7/107
        14 — НДС по ставке 22%
        15 — НДС по расчетной ставке 22/122
         */
        private byte GetTaxType(TaxType? taxType, ePaymentMethodType paymentMethodType)
        {
            if (taxType == null || taxType.Value == TaxType.VatWithout)
                return 0;

            if (taxType.Value == TaxType.Vat0)
                return 1;

            if (taxType.Value == TaxType.Vat5)
            {
                if (AdvantShop.Configuration.SettingsCheckout.TaxTypeByPaymentMethodType &&
                    (paymentMethodType == ePaymentMethodType.full_prepayment ||
                     paymentMethodType == ePaymentMethodType.partial_prepayment ||
                     paymentMethodType == ePaymentMethodType.advance))
                    return 11;
                else
                    return 10;
            }

            if (taxType.Value == TaxType.Vat7)
            {
                if (AdvantShop.Configuration.SettingsCheckout.TaxTypeByPaymentMethodType &&
                    (paymentMethodType == ePaymentMethodType.full_prepayment ||
                     paymentMethodType == ePaymentMethodType.partial_prepayment ||
                     paymentMethodType == ePaymentMethodType.advance))
                    return 13;
                else
                    return 12;
            }
            
            if (taxType.Value == TaxType.Vat10)
            {
                if (AdvantShop.Configuration.SettingsCheckout.TaxTypeByPaymentMethodType &&
                    (paymentMethodType == ePaymentMethodType.full_prepayment ||
                     paymentMethodType == ePaymentMethodType.partial_prepayment ||
                     paymentMethodType == ePaymentMethodType.advance))
                    return 4;
                else
                    return 2;
            }

            if (taxType.Value == TaxType.Vat22)
            {
                if (AdvantShop.Configuration.SettingsCheckout.TaxTypeByPaymentMethodType &&
                    (paymentMethodType == ePaymentMethodType.full_prepayment ||
                     paymentMethodType == ePaymentMethodType.partial_prepayment ||
                     paymentMethodType == ePaymentMethodType.advance))
                    return 15;
                else
                    return 14;
            }

            return 0;
        }
        
        private byte? GetMeasure(MeasureType? itemMeasureType)
        {
            if (itemMeasureType is null)
                return null;
            
            switch (itemMeasureType.Value)
            {
                case MeasureType.Piece:
                    return 0;
                case MeasureType.Gram:
                    return 10;
                case MeasureType.Kilogram:
                    return 11;
                case MeasureType.Ton:
                    return 12;
                case MeasureType.Centimetre:
                    return 20;
                case MeasureType.Decimeter:
                    return 21;
                case MeasureType.Metre:
                    return 22;
                case MeasureType.SquareCentimeter:
                    return 30;
                case MeasureType.SquareDecimeter:
                    return 31;
                case MeasureType.SquareMeter:
                    return 32;
                case MeasureType.Milliliter:
                    return 40;
                case MeasureType.Liter:
                    return 41;
                case MeasureType.CubicMeter:
                    return 42;
                case MeasureType.KilowattHour:
                    return 50;
                case MeasureType.Gigacaloria:
                    return 51;
                case MeasureType.Day:
                    return 70;
                case MeasureType.Hour:
                    return 71;
                case MeasureType.Minute:
                    return 72;
                case MeasureType.Second:
                    return 73;
                case MeasureType.Kilobyte:
                    return 80;
                case MeasureType.Megabyte:
                    return 81;
                case MeasureType.Gigabyte:
                    return 82;
                case MeasureType.Terabyte:
                    return 83;
                case MeasureType.Other:
                    return 255;
            }

            return null;
        }

        private T MakeRequest<T>(string url, Dictionary<string, string> data = null) where T : class
        {
            try
            {
                var request = WebRequest.Create((_gatewayUrl) + url) as HttpWebRequest;
                request.Timeout = 10000;
                request.Method = "POST";
                request.ContentType = "application/x-www-form-urlencoded";

                if (data != null)
                {
                    string dataPost = "";
                    foreach (var key in data.Keys)
                    {
                        var value = data[key];

                        if (string.IsNullOrEmpty(value))
                            continue;

                        if (dataPost != "")
                            dataPost += "&";

                        dataPost += key + "=" + HttpUtility.UrlEncode(value);
                    }

                    byte[] bytes = Encoding.UTF8.GetBytes(dataPost);
                    request.ContentLength = bytes.Length;

                    using (var requestStream = request.GetRequestStream())
                    {
                        requestStream.Write(bytes, 0, bytes.Length);
                        requestStream.Close();
                    }
                }

                var responseContent = "";
                using (var response = request.GetResponse())
                {
                    using (var stream = response.GetResponseStream())
                    {
                        if (stream != null)
                            using (var reader = new StreamReader(stream))
                            {
                                responseContent = reader.ReadToEnd();
                            }
                    }
                }

                var dataAnswer = JsonConvert.DeserializeObject<T>(responseContent);

                return dataAnswer;
            }
            catch (WebException ex)
            {
                using (var eResponse = ex.Response)
                {
                    if (eResponse != null)
                    {
                        using (var eStream = eResponse.GetResponseStream())
                            if (eStream != null)
                                using (var reader = new StreamReader(eStream))
                                {
                                    var error = reader.ReadToEnd();
                                    Debug.Log.Error(error, ex);
                                }
                            else
                                Debug.Log.Error(ex);
                    }
                    else
                        Debug.Log.Error(ex);
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }

            return null;
        }

        #endregion

    }
}
