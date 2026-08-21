using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Web;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Crm;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Core.Services.Loging;
using AdvantShop.Core.Services.Loging.Smses;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.Letters;
using AdvantShop.Orders;
using Task = System.Threading.Tasks.Task;

namespace AdvantShop.Core.Services.Smses
{
    public class SmsNotifier
    {
        private static ISmsLogger Logger => LoggingManager.GetSmsLogger();

        public static void SendSms(long phone,
            string text,
            Guid? customerId = null,
            bool throwException = false,
            bool inBackground = true,
            bool isInternal = false,
            int? templateId = null,
            Dictionary<string, string> templateParameters = null,
            Action onSuccess = null,
            Action<string> onError = null)
        {
            _sendSms(phone, text, customerId, throwException, inBackground, isInternal, templateId, templateParameters, false, onSuccess, onError);
        }

        public static string SendSmsNowWithResult(long phone,
            string text,
            bool isAuthCode = false,
            Guid? customerId = null,
            bool throwError = false,
            bool isInternal = false)
        {
            return _sendSms(phone, text, customerId, throwError, false, isInternal, null, null, isAuthCode);
        }

        public static void SendTestSms(long phone,
            string text)
        {
            _sendSms(phone, text, null, true, false, true, null, null, false);
        }
        
        #region Send sms on lead added, order added, order status changing

        public static void SendSmsOnLeadAdded(Lead lead)
        {
            if (!SettingsSms.SendSmsToAdminOnNewLead) 
                return;
            
            if (string.IsNullOrWhiteSpace(SettingsSms.SmsTextOnNewLead))
                return;
            
            var phones = (SettingsSms.AdminPhone ?? "").Split(new[] {','}, StringSplitOptions.RemoveEmptyEntries);
            if (phones.Length == 0)
                return;
            
            var customerId = HttpContext.Current != null ? CustomerContext.CustomerId : default(Guid?);
            var smsText = new LeadLetterBuilder(lead).FormatText(SettingsSms.SmsTextOnNewLead);

            foreach (var phone in phones)
            {
                SendSms(Convert.ToInt64(phone.Trim()), smsText, customerId, isInternal: true);
            }
        }

        public static void SendSmsOnOrderAdded(Order order)
        {
            var smsText = SettingsSms.SmsTextOnNewOrder;
            
            if (string.IsNullOrWhiteSpace(smsText))
                return;

            if (SettingsSms.SendSmsToCustomerOnNewOrder)
            {
                var customer = order.OrderCustomer;
                if (customer != null && customer.StandardPhone.HasValue)
                {
                    var sms = new OrderLetterBuilder(order).FormatText(smsText);
                    
                    SendSms(customer.StandardPhone.Value, sms, customer.CustomerID, isInternal: true);
                }
            }
            
            if (SettingsSms.SendSmsToAdminOnNewOrder)
            {
                var phones = (SettingsSms.AdminPhone ?? "").Split(new[] {','}, StringSplitOptions.RemoveEmptyEntries);
                var customerId = HttpContext.Current != null ? CustomerContext.CustomerId : default(Guid?);

                if (phones.Length > 0)
                {
                    var sms = new OrderLetterBuilder(order).FormatText(smsText);

                    foreach (var phone in phones)
                    {
                        SendSms(Convert.ToInt64(phone.Trim()), sms, customerId, isInternal: true);
                    }
                }
            }
        }

        public static void SendSmsOnOrderStatusChanging(Order order)
        {
            if (order == null || order.IsDraft || order.OrderStatus == null || order.OrderStatus.IsDefault)
                return;
            
            var smsTemplate = SmsOnOrderChangingService.GetByOrderStatusId(order.OrderStatus.StatusID);
            if (smsTemplate == null || !smsTemplate.Enabled)
                return;

            var smsText = smsTemplate.SmsText;

            if (SettingsSms.SendSmsToCustomerOnOrderStatusChanging)
            {
                var customer = order.OrderCustomer;
                if (customer != null && customer.StandardPhone.HasValue)
                {
                    var sms = new OrderLetterBuilder(order).FormatText(smsText);
                    
                    SendSms(customer.StandardPhone.Value, sms, customer.CustomerID, isInternal: true);
                }
            }

            if (SettingsSms.SendSmsToAdminOnOrderStatusChanging)
            {
                var phones = (SettingsSms.AdminPhone ?? "").Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                var customerId = HttpContext.Current != null ? CustomerContext.CustomerId : default(Guid?);

                if (phones.Length > 0)
                {
                    var sms = new OrderLetterBuilder(order).FormatText(smsText);

                    foreach (var phone in phones)
                    {
                        SendSms(Convert.ToInt64(phone.Trim()), sms, customerId, isInternal: true);
                    }
                }
            }
        }
        
        public static void SendSmsOnOrderPayStatusChanging(Order order)
        {
            var smsText = SettingsSms.SmsTextOnOrderPayStatusChanging;
            
            if (string.IsNullOrWhiteSpace(smsText))
                return;

            if (SettingsSms.SendSmsToCustomerOnOrderPayStatusChanging)
            {
                var customer = order.OrderCustomer;
                if (customer != null && customer.StandardPhone.HasValue)
                {
                    var sms = new OrderLetterBuilder(order).FormatText(smsText);
                    
                    SendSms(customer.StandardPhone.Value, sms, customer.CustomerID, isInternal: true);
                }
            }
            
            if (SettingsSms.SendSmsToAdminOnOrderPayStatusChanging)
            {
                var phones = (SettingsSms.AdminPhone ?? "").Split(new[] {','}, StringSplitOptions.RemoveEmptyEntries);
                var customerId = HttpContext.Current != null ? CustomerContext.CustomerId : default(Guid?);

                if (phones.Length > 0)
                {
                    var sms = new OrderLetterBuilder(order).FormatText(smsText);

                    foreach (var phone in phones)
                    {
                        SendSms(Convert.ToInt64(phone.Trim()), sms, customerId, isInternal: true);
                    }
                }
            }
        }
        
        #endregion

        public static List<ISmsService> GetAllSmsModules()
        {
            return AttachedModules.GetModuleInstances<ISmsService>() 
                   ?? new List<ISmsService>();
        }

        public static ISmsService GetActiveSmsModule()
        {
            if (SettingsSms.ActiveSmsModule == "-1")
                return null;

            var list = new List<ISmsService>();

            foreach (var moduleType in AttachedModules.GetModules<ISmsService>())
            {
                var module = (ISmsService) Activator.CreateInstance(moduleType);

                if (module.ModuleStringId == SettingsSms.ActiveSmsModule)
                    return module;

                list.Add(module);
            }

            return list.Count > 0 ? list[0] : null;
        }

        /// <summary>
        /// Send sms in background (or not) and throw error (or not)
        /// </summary>
        /// <param name="phone">Phone</param>
        /// <param name="text">Sms text</param>
        /// <param name="customerId">CustomerId</param>
        /// <param name="throwError">Throw if error</param>
        /// <param name="inBackground">In background</param>
        /// <param name="isInternal">Is internal system</param>
        /// <param name="templateId">template id if exists</param>
        /// <param name="templateParameters">template parameters if exists</param>
        /// <param name="isAuthCode">Is auth code if exists</param>
        /// <param name="onSuccess">Action on success sending</param>
        /// <param name="onError">Action on error sending</param>
        /// <returns>Sms result or null if in background</returns>
        private static string _sendSms(long phone,
            string text,
            Guid? customerId,
            bool throwError,
            bool inBackground,
            bool isInternal,
            int? templateId,
            Dictionary<string, string> templateParameters,
            bool isAuthCode,
            Action onSuccess = null,
            Action<string> onError = null)
        {
            var ip = !isInternal ? HttpContext.Current.TryGetIp() : null;

            var validateResult = new SmsValidationService(isInternal).Validate(phone, text, ip);
            if (!validateResult.IsSuccess)
            {
                onError?.Invoke(validateResult.Error.Message);
                
                if (throwError)
                    throw new BlException(validateResult.Error.Message);
                
                return null;
            }

            if (!inBackground)
                return 
                    _sendSms(phone, text, customerId, throwError, ip, templateId, templateParameters, isAuthCode, 
                                onSuccess, onError);
            

            Task.Run(() =>
            {
                _sendSms(phone, text, customerId, throwError, ip, templateId, templateParameters, isAuthCode, 
                            onSuccess, onError);
            });

            return null;
        }

        private static string _sendSms(long phone,
            string text,
            Guid? customerId,
            bool throwError,
            string ip,
            int? templateId,
            Dictionary<string, string> templateParameters,
            bool isAuthCode,
            Action onSuccess = null,
            Action<string> onError = null)
        {
            string result = null;
            var parameters = new SmsParameters
            {
                Phone = phone,
                Text = text,
                IsAuthCode = isAuthCode,
            };

            var status = SmsStatus.Error;
            try
            {
                var moduleSms = GetActiveSmsModule();
                if (moduleSms == null)
                {
                    onError?.Invoke("Не подключен модуль sms");
                    if (throwError) throw new BlException("Не подключен модуль sms");
                    return null;
                }

                if (SettingsSms.SmsTesting)
                    result = "1234";
                else
                {
                    if (templateId != null && moduleSms is ISmsAndSocialMediaService moduleSmsAndSocialMedia)
                    {
                        var smsAndSocialMediaParameters = new SmsAndSocialMediaParameters
                        {
                            Phone = parameters.Phone,
                            Text = parameters.Text,
                            IsAuthCode = parameters.IsAuthCode,
                            TemplateId = templateId.Value,
                            TemplateParameters = templateParameters
                        };

                        moduleSmsAndSocialMedia.SendSms(smsAndSocialMediaParameters);
                    }
                    else
                        moduleSms.SendSms(parameters);
                }

                status = SmsStatus.Sent;
            }
            catch (WebException ex)
            {
                using (var eResponse = ex.Response)
                    if (eResponse != null)
                    {
                        using (var eStream = eResponse.GetResponseStream())
                            if (eStream != null)
                                using (var reader = new StreamReader(eStream))
                                {
                                    var error = reader.ReadToEnd();
                                    Debug.Log.Error(error);
                                    onError?.Invoke($"Ошибка при отправки SMS: {error}");

                                    if (throwError)
                                    {
                                        Logger.LogSms(new SmsLog(customerId ?? Guid.Empty, phone, text, status));
                                        SmsLogger.Log(new SmsLogData(phone, text, ip, customerId, status));
                                        
                                        throw;
                                    }
                                }
                    }
            }
            catch (Exception ex)
            {
                Debug.Log.Error($"SendSms error: {phone} {text} {ip}, {customerId}", ex);
                onError?.Invoke($"Ошибка при отправки SMS: {ex.Message}");

                if (throwError)
                {
                    Logger.LogSms(new SmsLog(customerId ?? Guid.Empty, phone, text, status));
                    SmsLogger.Log(new SmsLogData(phone, text, ip, customerId, status));
                    
                    throw;
                }
            }

            Logger.LogSms(new SmsLog(customerId ?? Guid.Empty, phone, text, status));
            SmsLogger.Log(new SmsLogData(phone, text, ip, customerId, status));
            
            if (status == SmsStatus.Sent)
                onSuccess?.Invoke();

            return result;
        }
    }
}
