using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Payment.Robokassa;
using AdvantShop.Core.Services.Taxes;
using AdvantShop.Helpers;
using AdvantShop.Orders;

namespace AdvantShop.Payment
{
    public partial class Robokassa : ICloseReceipt
    {
        public CloseReceiptResult CloseReceipt(Order order)
        {
            if (!SendReceiptData)
                return CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.Robokassa.SendReceiptDataIsDisabled"));
            
            var paymentCurrency = PaymentCurrency ?? order.OrderCurrency;
            var receipt = GetReceipt(order, paymentCurrency, ePaymentMethodType.full_payment, marking: true);
            var sum = (float)Math.Round(order.Sum.ConvertCurrency(order.OrderCurrency, paymentCurrency).SubtractFee(Fee), 2);
            
            var secondCheck = new SecondCheck
            {
                merchantId = MerchantLogin,
                id = (int.MaxValue + (long)order.OrderID).ToString(),
                originId = order.OrderID.ToString(),
                url = StringHelper.ToPuny(SettingsMain.SiteUrl.ToLower()),
                total = sum,
                items = receipt.items,
                payments = new List<AdvantShop.Core.Services.Payment.Robokassa.Payment> { new AdvantShop.Core.Services.Payment.Robokassa.Payment { sum = sum } },
                vats = receipt.items
                              .GroupBy(item => item.tax)
                              .Select(group =>
                               {
                                   var vatSum = 0f;
                                   switch (group.Key)
                                   {
                                       case "vat10":
                                           vatSum = group.Sum(item => item.sum) / 100 * 10;
                                           break;
                                       case "vat110":
                                           vatSum = group.Sum(item => item.sum) / (100 + 10) * 10;
                                           break;
                                       case "vat18":
                                           vatSum = group.Sum(item => item.sum) / 100 * 18;
                                           break;
                                       case "vat118":
                                           vatSum = group.Sum(item => item.sum) / (100 + 18) * 18;
                                           break;
                                       case "vat20":
                                           vatSum = group.Sum(item => item.sum) / 100 * 20;
                                           break;
                                       case "vat120":
                                           vatSum = group.Sum(item => item.sum) / (100 + 20) * 20;
                                           break;
                                       case "vat5":
                                           vatSum = group.Sum(item => item.sum) / 100 * 5;
                                           break;
                                       case "vat105":
                                           vatSum = group.Sum(item => item.sum) / (100 + 5) * 5;
                                           break;
                                       case "vat7":
                                           vatSum = group.Sum(item => item.sum) / 100 * 7;
                                           break;
                                       case "vat107":
                                           vatSum = group.Sum(item => item.sum) / (100 + 7) * 7;
                                           break;
                                       case "vat22":
                                           vatSum = group.Sum(item => item.sum) / 100 * 22;
                                           break;
                                       case "vat122":
                                           vatSum = group.Sum(item => item.sum) / (100 + 22) * 22;
                                           break;
                                       default:
                                           if (group.Key != "none"
                                               && group.Key != "vat0"
                                               && group.Key.StartsWith("vat"))
                                           {
                                               var taxRate = group.Key.Substring(3).TryParseInt(true);
                                               if (taxRate.HasValue)
                                               {
                                                   if (taxRate < 100)
                                                       vatSum = group.Sum(item => item.sum) / 100 * taxRate.Value;
                                                   else
                                                   {
                                                       taxRate -= 100;
                                                       vatSum = group.Sum(item => item.sum) / (100 + taxRate.Value) * taxRate.Value;
                                                   }
                                               }
                                           }
                                           break;
                                   }
                                   
                                   return new Vat
                                   {
                                       type = group.Key,
                                       sum = (float)Math.Round(vatSum, 2),
                                   };
                               })
                              .ToList(),
            };
            
            if (!string.IsNullOrWhiteSpace(order.OrderCustomer?.Email)
                || order.OrderCustomer?.StandardPhone != null)
                secondCheck.client = new Client
                {
                    email = !string.IsNullOrWhiteSpace(order.OrderCustomer.Email) ? order.OrderCustomer.Email : null,
                    phone = order.OrderCustomer.StandardPhone.HasValue ? order.OrderCustomer.StandardPhone.ToString() : null,
                };
            var secondCheckString = Newtonsoft.Json.JsonConvert.SerializeObject(secondCheck);
            var base64 = Base64(secondCheckString).Replace("=", "");
            var hash = (base64 + Password).Md5();
            var hashBase64 = Base64(hash).Replace("=", "");
            var body = base64 + "." + hashBase64;

            var response = RobokassaHelper.SendCloseReceipt(body);

            var resultCode = response?.ResultCode;
            if (resultCode == "1"
                || resultCode == "2"
                || resultCode == "0")
                return CloseReceiptResult.CreateSuccessResult();

            return response != null
                ? CloseReceiptResult.CreateFailedResult(
                    message: response.ResultDescription.IsNotEmpty() ? response.ResultDescription : LocalizationService.GetResource("Core.Payment.Robokassa.SomethingWentWrong"),
                    errorCode: response.ResultCode)
                : CloseReceiptResult.CreateFailedResult(LocalizationService.GetResource("Core.Payment.Robokassa.SomethingWentWrong"));
        }
        
        private string Base64(string toEncode)
        {
            byte[] toEncodeAsBytes = Encoding.UTF8.GetBytes(toEncode);
            return Convert.ToBase64String(toEncodeAsBytes);
        }
    }
}