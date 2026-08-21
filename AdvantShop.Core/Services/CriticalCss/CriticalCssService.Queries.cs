using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Core.SQL;
using AdvantShop.CriticalCss.Enums;
using AdvantShop.Helpers;

namespace AdvantShop.CriticalCss
{
    public static partial class CriticalCssService
    {
        public static void MarkAllNeedUpdate()
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [dbo].[CriticalCss]
                SET [NeedUpdate] = 1",
                CommandType.Text
            );

            CacheManager.RemoveByPattern(CriticalCssPrefix);
        }

        public static void MarkNeedUpdateByKey(string key)
        {
            SQLDataAccess.ExecuteScalar(
                @"UPDATE [dbo].[CriticalCss]
                SET [NeedUpdate] = 1
                WHERE [Key] = @Key",
                CommandType.Text,
                new SqlParameter("@Key", key)
            );

            CacheManager.RemoveByPattern(CriticalCssPrefix + key);
        }

        public static void MarkNeedUpdateByTemplate(string template)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [dbo].[CriticalCss]
                SET [NeedUpdate] = 1
                WHERE [Template] = @Template",
                CommandType.Text,
                new SqlParameter("@Template", template)
            );

            CacheManager.RemoveByPattern(CriticalCssTemplatePrefix + template);
        }

        public static void MarkNeedUpdateByDevice(CriticalCssDevice device)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [dbo].[CriticalCss]
                SET [NeedUpdate] = 1
                WHERE [Device] = @Device",
                CommandType.Text,
                new SqlParameter("@Device", device.ToString())
            );
            
            CacheManager.RemoveByPattern(CriticalCssDevicePrefix + device);
        }

        public static void MarkNeedUpdateByLandingSite(string siteUrl)
        {
            var key = CriticalCssNames.GetLandingSiteName(siteUrl);

            SQLDataAccess.ExecuteScalar(
                @"UPDATE [dbo].[CriticalCss]
                SET [NeedUpdate] = 1
                WHERE [Key] LIKE @Key",
                CommandType.Text,
                new SqlParameter("@Key", key + "%")
            );

            CacheManager.RemoveByPattern(CriticalCssPrefix + key);
        }

        public static void MarkNeedUpdateByLanding(int landingId)
        {
            var landing = new LpService().Get(landingId);
            var key = CriticalCssNames.GetLandingName(landing.SiteUrl, landing.Url);
            
            MarkNeedUpdateByKey(key);
        }

        public static void RemoveByKey(string key)
        {
            SQLDataAccess.ExecuteScalar(
                @"DELETE [dbo].[CriticalCss]
                WHERE [Key] = @Key",
                CommandType.Text,
                new SqlParameter("@Key", key)
            );

            CacheManager.RemoveByPattern(CriticalCssPrefix + key);
        }

        public static void RemoveByLandingSite(string siteUrl)
        {
            var key = CriticalCssNames.GetLandingSiteName(siteUrl);

            SQLDataAccess.ExecuteScalar(
                @"DELETE [dbo].[CriticalCss]
                WHERE [Key] LIKE @Key",
                CommandType.Text,
                new SqlParameter("@Key", key + "%")
            );

            CacheManager.RemoveByPattern(CriticalCssPrefix + key);
        }

        public static string GetCss(string key)
        {
            var template = SettingsDesign.Template;
            var device = SettingsDesign.IsMobileTemplate
                ? nameof(CriticalCssDevice.Mobile)
                : nameof(CriticalCssDevice.Desktop);
            
            return CacheManager.Get(GetCacheName(key, device, template), () =>
                SQLDataHelper.GetString(
                    SQLDataAccess.ExecuteScalar(
                        @"SELECT [Value] 
                        FROM [dbo].[CriticalCss] 
                        WHERE [Key] = @Key 
                          AND [Device] = @Device
                          AND [Template] = @Template",
                        CommandType.Text,
                        new SqlParameter("@Key", key),
                        new SqlParameter("@Device", device),
                        new SqlParameter("@Template", template)
                    )
                )
            );
        }


        private static bool IsExistCss(
            string key,
            string template,
            CriticalCssDevice device
        ) => SQLDataAccess.ExecuteScalar<bool>(
            @"IF EXISTS(SELECT 1
                      FROM [dbo].[CriticalCss]
                      WHERE [Key] = @Key
                        AND [Device] = @Device
                        AND [Template] = @Template)
                BEGIN
                    SELECT 1
                END
            ELSE
                BEGIN
                    SELECT 0
                END",
            CommandType.Text,
            new SqlParameter("@Key", key),
            new SqlParameter("@Template", template),
            new SqlParameter("@Device", device.ToString())
        );

        private static void AddCss(CriticalCss criticalCss) =>
            SQLDataAccess.ExecuteNonQuery(
                @"INSERT INTO [dbo].[CriticalCss] 
                (
                    [Key],
                    [Value],
                    [Device],
                    [Template],
                    [NeedUpdate],
                    [UpdateAt]
                )
                VALUES 
                (
                    @Key,
                    @Value,
                    @Device,
                    @Template,
                    @NeedUpdate,
                    @UpdateAt
                )",
                CommandType.Text,
                GetAllParameters(criticalCss)
            );

        private static void UpdateCss(CriticalCss criticalCss)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [dbo].[CriticalCss]
                SET [Value]      = @Value,
                    [NeedUpdate] = @NeedUpdate,
                    [UpdateAt]   = @UpdateAt
                WHERE [Key] = @Key
                  AND [Device] = @Device
                  AND [Template] = @Template",
                CommandType.Text,
                GetAllParameters(criticalCss)
            );
            
            CacheManager.RemoveByPattern(CriticalCssPrefix + criticalCss.Key);
        }

        private static SqlParameter[] GetAllParameters(CriticalCss criticalCss) =>
            new[]
            {
                new SqlParameter("@Key", criticalCss.Key),
                new SqlParameter("@Value", criticalCss.Value ?? (object)DBNull.Value),
                new SqlParameter("@Device", criticalCss.Device.ToString()),
                new SqlParameter("@Template", criticalCss.Template),
                new SqlParameter("@NeedUpdate", criticalCss.NeedUpdate),
                new SqlParameter("@UpdateAt", criticalCss.UpdateAt),
            };

        private static List<string> GetExistsKeys(CriticalCssDevice device, string template) =>
            SQLDataAccess.ExecuteReadList(
                @"SELECT [Key]
                FROM [dbo].[CriticalCss]
                WHERE [Template] = @Template
                  AND [NeedUpdate] = 0
                  AND [Device] = @Device",
                CommandType.Text,
                reader => SQLDataHelper.GetString(reader, "Key"),
                new SqlParameter("@Template", template),
                new SqlParameter("@Device", device.ToString())
            );

        private static string GetCacheName(string key, string device, string template) =>
            CriticalCssPrefix + key + CriticalCssDevicePrefix + device + CriticalCssTemplatePrefix + template;
    }
}