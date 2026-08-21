using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL;

namespace AdvantShop.MobileApp
{
    public class MobileAppRequestHistoryService
    {
        public static void Log(byte[] ipBytes, string ip, string url, Guid? userId, string appVersion, string deviceId ,string metrics, int? metricsHashCode, Guid? appId)
        {
            url = url.IndexOf("/api/", StringComparison.OrdinalIgnoreCase) == 0
                    ? url.Substring(5)
                    : url;
            
            SQLDataAccess.ExecuteNonQuery(
                @"Insert Into Module.MobileApp_RequestHistory (Ip, CreatedOn, Url, IpStr, UserId, AppVersion, DeviceId, Metrics, MetricsHash, AppId) 
                Values (@Ip, GETDATE(), @Url, @IpStr, @UserId, @AppVersion, @DeviceId, @Metrics, @MetricsHash, @AppId)",
                CommandType.Text,
                new SqlParameter("@Ip", ipBytes),
                new SqlParameter("@Url", url.Reduce(350)),
                new SqlParameter("@IpStr", ip),
                new SqlParameter("@UserId", userId ?? (object)DBNull.Value),
                new SqlParameter("@AppVersion", appVersion.IsNotEmpty() ? appVersion.Reduce(50) : ""),
                new SqlParameter("@DeviceId", deviceId.IsNotEmpty() ? deviceId.Reduce(350) : (object)DBNull.Value),
                new SqlParameter("@Metrics", metrics ?? (object)DBNull.Value),
                new SqlParameter("@MetricsHash", metricsHashCode ?? (object)DBNull.Value),
                new SqlParameter("@AppId", appId ?? (object)DBNull.Value)
            );
        }

        public static bool IsExists(byte[] ip)
        {
            var checkAfterDate =
                SettingProvider.Items["MobileAppRequestHistory_CheckAfterDate"]?.TryParseDateTime(true);
            
            if (checkAfterDate == null || DateTime.Now < checkAfterDate.Value)
                return true;
            
            return SQLDataAccess.ExecuteScalar<bool>(
                "if exists (Select 1 From Module.MobileApp_RequestHistory Where Ip = @Ip and CreatedOn >= dateadd(hour, -3, GETDATE())) Select 1 Else Select 0",
                CommandType.Text,
                new SqlParameter("@Ip", ip) 
            );
        }

        /// <summary>
        /// Получить список ip, на которые были запросы с такого же устройства, кроме текущего ip
        /// </summary>
        public static List<string> GetOtherIpsByMetrics(byte[] ip, int metricsHashCode, string appVersion)
        {
            var ips = SQLDataAccess.ExecuteReadColumn<string>(
                @"Select distinct IpStr 
                            From Module.MobileApp_RequestHistory 
                            Where MetricsHash = @MetricsHash 
                              and AppVersion = @AppVersion 
                              and Ip <> @Ip 
                              and CreatedOn >= dateadd(hour, -1, GETDATE())",
                CommandType.Text,
                "IpStr",
                new SqlParameter("@Ip", ip),
                new SqlParameter("@MetricsHash", metricsHashCode),
                new SqlParameter("@AppVersion", appVersion ?? "")
            );
            
            return ips;
        }
        
        /// <summary>
        /// Получить список ip, на которые были запросы с такого же appId устройства, кроме текущего ip
        /// </summary>
        public static List<string> GetOtherIpsByAppId(byte[] ip, Guid appId)
        {
            var ips = SQLDataAccess.ExecuteReadColumn<string>(
                @"Select distinct IpStr 
                            From Module.MobileApp_RequestHistory 
                            Where AppId = @AppId 
                              and Ip <> @Ip 
                              and CreatedOn >= dateadd(hour, -1, GETDATE())",
                CommandType.Text,
                "IpStr",
                new SqlParameter("@Ip", ip),
                new SqlParameter("@AppId", appId)
            );
            
            return ips;
        }

        public static void Clear()
        {
            SQLDataAccess.ExecuteNonQuery(
                "DELETE FROM Module.MobileApp_RequestHistory Where CreatedOn < dateadd(day, -3, GETDATE())",
                CommandType.Text);
        }
    }
}