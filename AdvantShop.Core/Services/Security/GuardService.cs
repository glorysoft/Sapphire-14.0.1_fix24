using System;
using System.Linq;
using System.Web;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Core.SQL;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;

namespace AdvantShop.Core.Services.Security
{
    public class GuardService
    {
        private const int BanMinutes = 60;
        private const string BanCachePrefix = "guard_ip_ban_";
        
        private static readonly object LockObject = new object();
        
        /// <summary>
        /// Проверит есть ли вредоносный текст в строке и забанит ip если есть
        /// </summary>
        /// <param name="text">текст</param>
        /// <returns>True - вредоносный текст найден</returns>
        public static bool IsMaliciousTextAndBanByIp(string text)
        {
            if (string.IsNullOrEmpty(text) || !HasBlockedWordsInText(text))
                return false;

            BanIp(text);
            
            return true;
        }
        
        public static bool CheckUrlAndBanByIp(string url)
        {
            if (string.IsNullOrWhiteSpace(url) || !HasBlockedWordsInUrl(url))
                return true;
            
            BanIp(url);

            return false;
        }

        public static bool HasBlockedWordsInText(string text)
        {
            var blockItems =
                CacheManager.Get("guard_blocklist_text", 30,
                    () =>
                        SQLDataAccess.Query<string>("Select [Term] From [Settings].[GuardBlockWordsInText]")
                            .ToHashSet(StringComparer.OrdinalIgnoreCase)
                );
            
            var hasBadWords = blockItems.Any(text.Contains);
            if (hasBadWords)
                return true;
            
            var span = text.AsSpan().Trim();

            if (span.StartsWith("{{".AsSpan()) && span.EndsWith("}}".AsSpan()))
                return true;
            
            return false;
        }
        
        public static bool HasBlockedWordsInUrl(string url)
        {
            var blockItems =
                CacheManager.Get("guard_blocklist_url", 30,
                    () => SQLDataAccess.Query<string>("Select [Term] From [Settings].[GuardBlockWordsInUrl]").ToList());
            
            var hasBadWords = blockItems.Any(word => url.Contains(word, StringComparison.OrdinalIgnoreCase));
            if (hasBadWords) 
                return true;
            
            return false;
        }
        
        public static bool IsIpBanned(string ip)
        {
            return CacheManager.Contains(BanCachePrefix + ip);
        }

        private static bool BanIp(string text)
        {
            var customer = CustomerContext.CurrentCustomer;
            if (customer.IsAdmin || customer.IsModerator || customer.IsVirtual)
                return false;
            
            var ip = HttpContext.Current.TryGetIp();

            if (ip == null || ip.IsLocalIP())
                return false;

            var key = BanCachePrefix + ip;
            
            lock (LockObject)
            {
                if (!CacheManager.Contains(key))
                    CacheManager.Insert(key, true, BanMinutes);
            }
            
            Debug.Log.Error($"ip {ip} banned on {BanMinutes} minutes because of '{text}'");

            return true;
        }
    }
}