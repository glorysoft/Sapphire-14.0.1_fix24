using System;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Core.SQL;
using AdvantShop.Diagnostics;

namespace AdvantShop.Core.Services.Auth.Totp
{
    public class TotpBanService
    {
        public static void Ban(string ip, DateTime untilDate)
        {
            if (string.IsNullOrEmpty(ip)) return;
            
            SQLDataAccess.ExecuteNonQuery(
                "INSERT INTO [Customers].[TotpBan] (Ip, UntilDate) VALUES (@Ip, @UntilDate)",
                CommandType.Text,
                new SqlParameter("@Ip", ip),
                new SqlParameter("@UntilDate", untilDate)
            );
            
            Debug.Log.Info($"totp auth ban {ip} {untilDate}");
        }
        
        public static bool IsBannedByIp(string ip)
        {
            return SQLDataAccess.ExecuteScalar<int>(
                "IF EXISTS (SELECT 1 FROM [Customers].[TotpBan] WHERE Ip=@Ip AND UntilDate > @UntilDate) " +
                "SELECT 1 ELSE SELECT 0",
                CommandType.Text,
                new SqlParameter("@Ip", ip ?? string.Empty),
                new SqlParameter("@UntilDate", DateTime.Now)) == 1;
        }
    }
}