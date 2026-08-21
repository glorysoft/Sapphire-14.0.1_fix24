using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web;
using AdvantShop.Catalog;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.SQL;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.Helpers;
using Newtonsoft.Json;

namespace AdvantShop.Core.Services.Customers
{
    public class ReferralService
    {
        private const string ReferralCodeCookieName = "referralCode";
        private const int ReferralCodeCookieExpires = 365;
        private const char ReferralCodeSeparator = '-';
        
        public static Guid? GetReferralCustomerId(Guid customerId) =>
            SQLDataAccess.ExecuteReadOne(
                "SELECT TOP(1) ReferralCustomerId FROM [Customers].[ReferralCustomer] WHERE CustomerId=@CustomerId",
                CommandType.Text, reader => SQLDataHelper.GetNullableGuid(reader["ReferralCustomerId"]),
                new SqlParameter("@CustomerId", customerId));

        public static void BindNewCustomer(Customer customer)
        {
            if (HttpContext.Current == null)
                return;
            
            //if admin or form admin area
            if (CustomerContext.CurrentCustomer != null && (CustomerContext.CurrentCustomer.IsAdmin ||
                                                            CustomerContext.CurrentCustomer.IsModerator))
            {
                return;
            }
            
            try
            {
                var data = GetReferralCodeCookieData();
                if (data != null && !data.ReferralCustomerCode.IsNullOrEmpty())
                {
                    var referralCustomer = CustomerService.GetCustomerByReferralCode(data.ReferralCustomerCode);
                    if (referralCustomer != null && GetReferralCustomerId(customer.Id) == null)
                        AddBindedCustomer(customer.Id, referralCustomer.Id);
                    
                    CommonHelper.DeleteCookie(ReferralCodeCookieName);
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
        }


        private static void AddBindedCustomer(Guid customerId, Guid referralCustomerId)
        {
            if (customerId == referralCustomerId)
                return;

            SQLDataAccess.ExecuteNonQuery(
                "INSERT INTO [Customers].[ReferralCustomer] (CustomerId, ReferralCustomerId) " +
                "VALUES (@CustomerId, @ReferralCustomerId)",
                CommandType.Text,
                new SqlParameter("@CustomerId", customerId),
                new SqlParameter("@ReferralCustomerId", referralCustomerId));
        }

        public static int CountInvitedCustomers(Guid referralCustomerId) =>
            SQLDataAccess.ExecuteScalar<int>(
                "SELECT COUNT(*) FROM [Customers].[ReferralCustomer] WHERE ReferralCustomerId=@ReferralCustomerId",
                CommandType.Text,
                new SqlParameter("@ReferralCustomerId", referralCustomerId));

        private static ReferralCodeData GetDataFromReferralCode(string referralCode)
        {
            int index = referralCode?.IndexOf(ReferralCodeSeparator) ?? -1;
            if (index == -1)
                return new ReferralCodeData();
            return new ReferralCodeData
            {
                ReferralCustomerCode = referralCode.Substring(0, index),
                ReferralCouponCode = referralCode.Substring(index + 1)
            };
        }

        private static void SetReferralCodeCookie(ReferralCodeData referralCodeData)
        {
            //if admin or form admin area
            if (CustomerContext.CurrentCustomer != null && (CustomerContext.CurrentCustomer.IsAdmin ||
                                                            CustomerContext.CurrentCustomer.IsModerator))
            {
                return;
            }
            
            referralCodeData.Hash = GetTrafficSourceHash(referralCodeData);
            var expires = TimeSpan.FromDays(ReferralCodeCookieExpires);
            var valueHash = Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(referralCodeData)));
            CommonHelper.SetCookie(ReferralCodeCookieName, valueHash, expires, true);
        }
        
        public static ReferralCodeData GetReferralCodeCookieData()
        {
            //if admin or form admin area
            if (CustomerContext.CurrentCustomer != null && (CustomerContext.CurrentCustomer.IsAdmin ||
                                                            CustomerContext.CurrentCustomer.IsModerator))
            {
                CommonHelper.DeleteCookie(ReferralCodeCookieName);
                return null;
            }
            
            var valueHash = CommonHelper.GetCookieString(ReferralCodeCookieName);
            
            try
            {
                var json = Encoding.UTF8.GetString(Convert.FromBase64String(HttpUtility.UrlDecode(valueHash)));
                var result = json.IsNullOrEmpty() ? null : JsonConvert.DeserializeObject<ReferralCodeData>(json);
                if (result != null && result.Hash != GetTrafficSourceHash(result))
                    return null;
                return result;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                return null;
            }
        }
        
        private static string GetTrafficSourceHash(ReferralCodeData source)
        {
            return new List<string>
            {
                source.ReferralCustomerCode,
                source.ReferralCouponCode,

            }.Select(x => x.DefaultOrEmpty()).AggregateString(":").Md5(false);
        }

        public static ReferralCodeData ApplyReferralProgram(string referralCode, bool applyCoupon)
        {
            referralCode = referralCode.IsNullOrEmpty()
                ? HttpContext.Current?.Request.QueryString["referralCode"]
                : referralCode;
            if (referralCode.IsNullOrEmpty()) return null;

            var referralCodeData = GetDataFromReferralCode(referralCode);

            if (BonusSystem.IsActive && BonusSystem.IsInternal && InternalBonusSystem.BringFriendIsEnabled &&
                !referralCodeData.ReferralCustomerCode.IsNullOrEmpty() &&
                CustomerService.IsReferralCodeExist(referralCodeData.ReferralCustomerCode))
            {
                SetReferralCodeCookie(referralCodeData);
                
                if (applyCoupon && !referralCodeData.ReferralCouponCode.IsNullOrEmpty())
                {
                    var coupon = CouponService.GetCouponByCode(referralCodeData.ReferralCouponCode);
                    CouponService.ApplyCustomerCouponFromUrl(coupon, referralCodeData.ReferralCustomerCode);
                }
            }

            return referralCodeData;
        }
    }
}