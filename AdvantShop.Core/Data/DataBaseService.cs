//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Data;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.SQL;
using ByteSizeLib;

namespace AdvantShop.Core
{
    public enum PingDbState
    {
        NoError = 0,
        FailConnectionSqlDb = 1,
        WrongDbStructure = 2,
        WrongDbVersion = 3,
        Unknown = 4
    }

    public class DataBaseService
    {
        public static string GetDbVersionFromConfig()
        {
            try
            {
                return SettingProvider.GetConfigSettingValue("DB_Version");
            }
            catch
            {
                // nothing here
            }
            return "";

        }

        public static string GetkDBVersionFomDatabase()
        {
            return SettingProvider.GetInternalSetting("db_version", false);
        }

        public static bool PingDateBase()
        {
            bool boolRes = false;
            try
            {
                using (var db = new SQLDataAccess())
                {
                    db.cmd.CommandText = "SELECT GETDATE() AS NOWDATE";
                    db.cmd.CommandType = CommandType.Text;
                    db.cmd.CommandTimeout = 10;

                    object obj = null;

                    db.cnOpen();

                    if (db.cnStatus() == ConnectionState.Open)
                    {
                        obj = db.cmd.ExecuteScalar();
                    }

                    db.cnClose();

                    if ((obj != null) && (!(obj is DBNull)))
                    {
                        boolRes = true;
                    }
                }
            }
            catch
            {
                boolRes = false;
            }

            return boolRes;
        }


        private const string CheckDbStateKey = nameof(DataBaseService) + "_" + nameof(CheckDbStates);
        public static PingDbState CheckDbStates()
        {
            var tryGetValue = CacheManager.TryGetValue(CheckDbStateKey, out PingDbState status);
            if (tryGetValue is false)
            {
                status = PingDbState.NoError;
                var dbVersionFomDatabase = GetkDBVersionFomDatabase();
                var dbVersionFromConfig = GetDbVersionFromConfig();

                if (string.IsNullOrEmpty(dbVersionFomDatabase))
                {
                    status = PingDbState.FailConnectionSqlDb;
                }
                else if (string.IsNullOrEmpty(dbVersionFromConfig))
                {
                    status = PingDbState.Unknown;
                }
                else if (dbVersionFomDatabase != dbVersionFromConfig)
                { 
                    status = PingDbState.WrongDbVersion;
                }

                if (status == PingDbState.NoError)
                {
                    CacheManager.Insert(CheckDbStateKey, status, 10);
                }
            }

            return status;

            //if (!DataBaseService.PingDateBase())
            //{
            //    return PingDbState.FailConnectionSqlDb;
            //}

            //if (!DataBaseService.CheckDBStructure())
            //{
            //    return PingDbState.WrongDbStructure;
            //}

            //if (!DataBaseService.CheckDBVersion())
            //{
            //    return PingDbState.WrongDbVersion;
            //}

            //return PingDbState.NoError;
        }

        /// <summary>
        /// Get total DB size (with log file)
        /// </summary>
        public static ByteSize CalcDbSize() => 
            ByteSize.FromKiloBytes(SQLDataAccess.ExecuteScalar<long>("SELECT SUM(size) FROM sys.database_files", CommandType.Text) * 8);
    }
}