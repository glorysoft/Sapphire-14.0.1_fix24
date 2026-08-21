//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Web;
using System.Web.Security;
using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Customers;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Core.Services.Partners;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.GeoModes;
using AdvantShop.Helpers;
using AdvantShop.Orders;

namespace AdvantShop.Security
{
    public class AuthorizeService
    {
        private const string Splitter = ":";

        public static Customer GetAuthenticatedCustomer()
        {
            if (HttpContext.Current == null || !HttpContext.Current.TryGetRequest(out var request)) return null;

            var formsCookie = request.Cookies[FormsAuthentication.FormsCookieName];
            if (formsCookie != null)
            {
                try
                {
                    var formsAuthenticationTicket = FormsAuthentication.Decrypt(formsCookie.Value);
                    if (formsAuthenticationTicket != null)
                    {
                        var token = formsAuthenticationTicket.Name;
                        var words = token.Split(new[] { Splitter }, StringSplitOptions.RemoveEmptyEntries);
                        if (words.Length != 2) return null;
                        var isParsedToGuid = Guid.TryParse(words[0], out var customerId);
                        var passHash = words[1];

                        if (isParsedToGuid)
                            return customerId == Guid.Empty
                                ? null
                                : CustomerService.GetCustomerByIdAndPassword(customerId, passHash, true);

                        var email = words[0];
                        return string.IsNullOrWhiteSpace(email)
                            ? null
                            : CustomerService.GetCustomerByEmailAndPassword(email, passHash, true);
                    }
                }
                catch (Exception ex) when (ex is CryptographicException || ex is ArgumentException)
                {
                    SignOutCore();
                    
                    var alreadyCleared = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                    {
                        FormsAuthentication.FormsCookieName,
                        "customer"
                    };

                    foreach (var cookieName in request.Cookies.AllKeys)
                    {
                        if (alreadyCleared.Contains(cookieName)) continue;
                        CommonHelper.DeleteCookie(cookieName);
                    }
                }
                catch (Exception ex)
                {
                    Debug.Log.Error(ex);
                }
            }

            return null;
        }

        public static bool SignIn(
            string email, 
            string password, 
            bool isHash, 
            bool createPersistentCookie,
            out Customer customer, 
            string adminFcmToken = null
        )
        {
            customer = null;

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                return false;

            var isDebug = Secure.IsDebugAccount(email, password);
            if (isDebug)
            {
                SignInDebug(out customer);
                return true;
            }

            customer = CustomerService.GetCustomerByEmailAndPassword(email, password, isHash);
            if (customer == null || !customer.Enabled)
                return false;

            SignInCore(customer, createPersistentCookie);

            if (!string.IsNullOrWhiteSpace(adminFcmToken))
                CustomerAdminPushNotificationService.UpdateFcmToken(customer.Id, adminFcmToken);

            ModulesExecuter.CustomerSignIn(customer);

            return true;
        }

        public static bool SignIn(string email, string password, bool isHash, bool createPersistentCookie, string adminFcmToken = null)
        {
            return SignIn(email, password, isHash, createPersistentCookie, out _, adminFcmToken);
        }

        public static bool SignInByPhone(long? phone, string password, bool isHash, bool createPersistentCookie,
            out Customer customer)
        {
            customer = null;

            if (!phone.HasValue || phone.Value == 0 || string.IsNullOrEmpty(password))
                return false;

            customer = CustomerService.GetCustomerByStandardPhoneAndPassword(phone.Value, password, isHash);
            if (customer == null)
                return false;

            SignInCore(customer, createPersistentCookie);
            
            ModulesExecuter.CustomerSignIn(customer);

            return true;
        }

        public static bool SignInByPhone(long? phone, string password, bool isHash, bool createPersistentCookie)
        {
            return SignInByPhone(phone, password, isHash, createPersistentCookie, out _);
        }

        public static bool IsTwoFactorAuth(string email, string password)
        {
            var twoFactorModules = AttachedModules.GetModules<ITwoFactorAuthentication>();
            if (twoFactorModules == null || twoFactorModules.Count == 0)
                return false;
            var moduleInstance = (ITwoFactorAuthentication)Activator.CreateInstance(twoFactorModules[0], null);
            var customer = CustomerService.GetCustomerByEmailAndPassword(email, password, false);
            if (customer != null && (customer.IsAdmin || customer.IsModerator))
                return moduleInstance.HasUserEnabledAuthentication(customer.Id);

            return false;
        }
        
        public static bool IsTwoFactorAuthCodeValid(string email, string password, string code)
        {
            var twoFactorModules = AttachedModules.GetModules<ITwoFactorAuthentication>();
            if (twoFactorModules == null || twoFactorModules.Count == 0)
                return true;
            var moduleInstance = (ITwoFactorAuthentication)Activator.CreateInstance(twoFactorModules[0], null);
            var customer = CustomerService.GetCustomerByEmailAndPassword(email, password, false);
            var key = moduleInstance.GetCodes(customer.Id, email).SecretKey;
            
            return moduleInstance.CheckCodeValid(key, code);
        }

        public static string GenerateCodeForRestoreTotp(int count)
        {
            var random = new Random();
            const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string digitsOrLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

            var code = new char[count];
            int letterPos = random.Next(count);
            code[letterPos] = letters[random.Next(letters.Length)];

            for (int i = 0; i < count; i++)
                if (i != letterPos) code[i] = digitsOrLetters[random.Next(digitsOrLetters.Length)];

            return new string(code);
        }

        private static void SignInCore(Customer customer, bool createPersistentCookie)
        {
            var oldCustomerId = CustomerContext.CurrentCustomer.Id;

            Secure.AddUserLog(customer.EMail, true, customer.IsAdmin);
            ShoppingCartService.MergeShoppingCarts(oldCustomerId, customer.Id);
            CustomerContext.SetCustomerCookie(customer.Id);
            FormsAuthentication.SetAuthCookie(customer.Id + Splitter + customer.Password, createPersistentCookie);

            AdjustFormsCookieDomainAndPath();

            new GeoModeService().SetIpZoneByCustomersCity(customer);
        }

        private static void SignInDebug(out Customer customer)
        {
            CustomerContext.IsDebug = true;

            customer = new Customer
            {
                CustomerRole = Role.Administrator,
                IsVirtual = true,
                Enabled = true
            };
            HttpContext.Current.Items["CustomerContext"] = customer;

            CustomerContext.SetDontDisturbByNotifyCookie(TimeSpan.FromDays(1));

            Secure.AddUserLog("sa", true, true);
        }

        /// <summary>
        /// Полный выход пользователя: сбрасывает auth-куку (через <see cref="SignOutCore"/>)
        /// и дополнительно очищает реферальную куку, чтобы новые сессии не привязывались
        /// к предыдущему партнёру. Использовать при явном logout'е пользователя.
        /// </summary>
        public static void SignOut()
        {
            SignOutCore();

            //удаляем куку после выхода из аккаунта чтобы не привязывались другие пользователи
            PartnerService.ClearReferralCookie();
        }

        /// <summary>
        /// Базовый сброс аутентификации: удаляет customer-куку, зовёт <see cref="FormsAuthentication.SignOut"/>
        /// и нормализует Domain/Path форм-куки (<see cref="AdjustFormsCookieDomainAndPath"/>) так, чтобы
        /// удаляющая Set-Cookie совпала с оригинальной по атрибутам и реально снеслась браузером.
        /// Не трогает реферальную куку — использовать в неявных сценариях сброса
        /// </summary>
        private static void SignOutCore()
        {
            CustomerContext.IsDebug = false;
            CustomerContext.DeleteCustomerCookie();
            FormsAuthentication.SignOut();
            AdjustFormsCookieDomainAndPath();
        }

        private static HttpCookie GetFormsCookie()
        {
            var arrCookie = new HttpCookie[HttpContext.Current.Response.Cookies.Count];
            HttpContext.Current.Response.Cookies.CopyTo(arrCookie, 0);
            return arrCookie
                .OrderByDescending(cookie => cookie.Expires)
                .FirstOrDefault(cookie => cookie.Name == FormsAuthentication.FormsCookieName);
        }

        private static void AdjustFormsCookieDomainAndPath()
        {
            if (HttpContext.Current == null) return;

            var request = HttpContext.Current.Request;
            var response = HttpContext.Current.Response;

            var formsCookie = GetFormsCookie();
            if (formsCookie is null) return;

            var domainSet = false;
            if (SettingsMain.IsTechDomainsReady
                && request.IsAdvantshopAdminProxy()
                && !string.IsNullOrWhiteSpace(request.Headers["X-Forwarded-Host"]))
            {
                var forwardedHostHeader = request.Headers["X-Forwarded-Host"].TrimEnd('/');
                var forwardedHostPathHeader = request.Headers["X-Forwarded-Host-Path"].TrimStart('/');

                if (!string.IsNullOrWhiteSpace(forwardedHostHeader))
                {
                    formsCookie.Domain = "." + forwardedHostHeader;
                    domainSet = true;
                }

                if (!string.IsNullOrWhiteSpace(forwardedHostPathHeader))
                    formsCookie.Path = "/" + forwardedHostPathHeader;
            }

            if (!domainSet && SettingsMain.SetCookieOnMainDomain)
                formsCookie.Domain = "." + SettingsMain.SiteUrlPlain;

            if (!domainSet && request.ApplicationPath != null)
                formsCookie.Path = "/" + request.ApplicationPath.TrimStart('/');

            if (UrlService.IsSecureConnection(request))
            {
                formsCookie.SameSite = SameSiteMode.None;
                formsCookie.Secure = true;
            }

            response.Cookies.Remove(FormsAuthentication.FormsCookieName);
            response.Cookies.Add(formsCookie);
        }
    }
}