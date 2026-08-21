using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Threading;
using System.Web;
using System.Web.Hosting;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.SQL;
using AdvantShop.Diagnostics;
using AdvantShop.Helpers;
using Newtonsoft.Json;

namespace AdvantShop.Core.Services.Localization
{
    public static class LocalizationService
    {
        internal static string LoadSingleResource(string cultureName, string resourceKey)
        {
            return SQLDataAccess.ExecuteScalar<string>(
                @"SELECT ResourceValue 
                FROM [Settings].[Localization]
                LEFT JOIN [Settings].[Language] ON [Language].[LanguageID] = [Localization].[LanguageId]
                WHERE LanguageCode = @cultureName 
                  AND ResourceKey = @resourceKey",
                CommandType.Text,
                new SqlParameter("@cultureName", cultureName),
                new SqlParameter("@resourceKey", resourceKey)
            );
        }

        internal static ConcurrentDictionary<string, string> LoadGroupResources(string cultureName, List<string> prefixes)
        {
            var conditions = new List<string>();
            var parameters = new List<SqlParameter> { new SqlParameter("@cultureName", cultureName) };

            for (var i = 0; i < prefixes.Count; i++)
            {
                conditions.Add($"(ResourceKey = @pe{i} OR ResourceKey LIKE @p{i})");
                parameters.Add(new SqlParameter($"@pe{i}", prefixes[i]));
                parameters.Add(new SqlParameter($"@p{i}", prefixes[i] + ".%"));
            }
            
            var dict = new ConcurrentDictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            
            SQLDataAccess.ExecuteForeach(
                $@"SELECT [ResourceKey], [ResourceValue] 
                FROM [Settings].[Localization]
                LEFT JOIN [Settings].[Language] ON [Language].[LanguageID] = [Localization].[LanguageId]
                WHERE LanguageCode = @cultureName 
                  AND ({string.Join(" OR ", conditions)})", 
                CommandType.Text,
                reader => dict.TryAdd(
                    SQLDataHelper.GetString(reader, "ResourceKey"),
                    SQLDataHelper.GetString(reader, "ResourceValue")
                ),
                parameters.ToArray()
            );

            return dict;
        }

        private static readonly object LockObj = new object();

        public static void ReloadLocalizedSets()
        {
            CacheManager.RemoveByPattern(LocalizationProvider.Instance.CacheKeyPrefix);
        }

        public static string GetResource(string resourceKey)
        {
            var cultureName = (HttpContext.Current != null ? HttpContext.Current.Items["Culture"] as string : null) 
                              ?? Thread.CurrentThread.CurrentUICulture.Name;

            return GetResource(resourceKey, cultureName);
        }

        public static string GetResource(string resourceKey, string cultureName)
        {
            if (LocalizationProvider.Instance.TryGetLocalization(resourceKey, cultureName, out var result))
                return result;

            return resourceKey;
        }

        public static string GetResourceFormat(string resourceKey, object param1)
        {
            return string.Format(GetResource(resourceKey), param1);
        }

        public static string GetResourceFormat(string resourceKey, object param1, object param2)
        {
            return string.Format(GetResource(resourceKey), param1, param2);
        }

        public static string GetResourceFormat(string resourceKey, params object[] parametres)
        {
            return string.Format(GetResource(resourceKey), parametres);
        }

        public static ConcurrentDictionary<string, string> GetResources(string cultureName)
        {
            var dict = new ConcurrentDictionary<string, string>();
            SQLDataAccess.ExecuteForeach(
                @"SELECT [ResourceKey], [ResourceValue] 
                FROM [Settings].[Localization]
                LEFT JOIN [Settings].[Language] ON [Language].[LanguageID] = [Localization].[LanguageId]
                WHERE LanguageCode=@cultureName",
                CommandType.Text, (reader) => dict.TryAdd(
                    SQLDataHelper.GetString(reader, "ResourceKey"),
                    SQLDataHelper.GetString(reader, "ResourceValue")
                ),
                new SqlParameter("@cultureName", cultureName)
            );

            return dict;
        }

        // Загружает локализации по префиксу ключа — используется для специфичных выборок
        public static ConcurrentDictionary<string, string> GetResourcesByPrefix(string resourceKeyPrefix)
        {
            var dict = new ConcurrentDictionary<string, string>();
            SQLDataAccess.ExecuteForeach(
                @"SELECT [ResourceKey], [ResourceValue] 
                FROM [Settings].[Localization]
                WHERE [ResourceKey] LIKE @prefix",
                CommandType.Text, 
                reader => dict.TryAdd(
                    SQLDataHelper.GetString(reader, "ResourceKey"),
                    SQLDataHelper.GetString(reader, "ResourceValue")
                ),
                new SqlParameter("@prefix", resourceKeyPrefix + "%"));

            return dict;
        }

        public static void AddOrUpdateResource(int languageId, string resourceKey, string resourceValue, string modifiedBy = null)
        {
            SQLDataAccess.ExecuteNonQuery(
                "[Settings].[sp_AddUpdateLocalization]",
                CommandType.StoredProcedure,
                new SqlParameter("@LanguageId", languageId),
                new SqlParameter("@ResourceKey", resourceKey),
                new SqlParameter("@ResourceValue", resourceValue),
                new SqlParameter("@ModifiedBy", modifiedBy ?? (object)DBNull.Value)
            );

            var language = LanguageService.GetLanguage(languageId);
            if (language != null)
            {
                //CultureLocalization.SetResource(resourceKey, resourceValue, language.LanguageCode);
                LocalizationProvider.Instance.SetLocalization(resourceKey, resourceValue, language.LanguageCode);
            }
        }

        public static void RemoveByPattern(string key)
        {
            SQLDataAccess.ExecuteNonQuery(
                $@"DELETE FROM [Settings].[Localization]
                Where ResourceKey Like '{key.ToLower()}%'",
                CommandType.Text
            );

            //CacheManager.RemoveByPattern(CultureLocalization.CacheKeyPrefix);
            CacheManager.RemoveByPattern(LocalizationProvider.Instance.CacheKeyPrefix);
        }

        public static void GenerateJsResourcesFile()
        {
            var cultureName = SettingsMain.Language.ToLower();

            lock (LockObj)
            {
                GenerateJsResourcesFile(HostingEnvironment.MapPath("~/userfiles/"), cultureName, false);
                GenerateJsResourcesFile(HostingEnvironment.MapPath("~/userfiles/"), cultureName, true);
            }
        }

        private static void GenerateJsResourcesFile(string localizationDirPath, string cultureName, bool isAdmin)
        {
            var localizationFilePath = localizationDirPath + "\\" + (isAdmin ? "admin_" : "") + cultureName + ".js";

            FileHelpers.CreateDirectory(localizationDirPath);

            Dictionary<string, string> jsResources;

            try
            {
                jsResources = SQLDataAccess.ExecuteReadDictionary<string, string>(
                    $@"SELECT ResourceKey,ResourceValue 
                    FROM Settings.Localization
                    LEFT JOIN [Settings].[Language] ON [Language].[LanguageID] = [Localization].[LanguageId]
                    WHERE LanguageCode=@CultureName 
                      AND ResourceKey LIKE {(!isAdmin ? "'Js.%'" : "'Admin.Js.%'")}",
                    CommandType.Text,
                    "ResourceKey", "ResourceValue",
                    new SqlParameter("@CultureName", cultureName)
                );
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                return;
            }

            var jsResourceObject =
                string.Format(isAdmin ? "window.AdvantshopAdminResource = {0};" : "window.AdvantshopResource = {0};",
                    JsonConvert.SerializeObject(jsResources));

            using (var sw = new StreamWriter(localizationFilePath))
            {
                sw.Write(jsResourceObject);
            }
        }

        public static bool IsExistResourceKey(string cultureName, string key) =>
            SQLDataAccess.ExecuteScalar<bool>(
                @"SELECT CAST(COUNT(1) AS BIT)
                FROM [Settings].[Localization]
                LEFT JOIN [Settings].[Language] ON [Language].[LanguageID] = [Localization].[LanguageId]
                WHERE LanguageCode = @CultureName
                  AND ResourceKey = @Key",
                CommandType.Text,
                new SqlParameter("@CultureName", cultureName),
                new SqlParameter("@Key", key)
            );
    }
}