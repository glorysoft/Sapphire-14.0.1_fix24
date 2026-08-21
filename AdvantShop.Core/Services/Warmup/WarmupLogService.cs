using System;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL;

namespace AdvantShop.Warmup
{
    public sealed class WarmupLogService
    {
        private WarmupLog _log = new WarmupLog();

        public WarmupLogService(string info)
        {
            _log.Info = info;
        }

        public void Start()
        {
            _log.StartTime = DateTime.Now;
        }

        public void Finish()
        {
            _log.EndTime = DateTime.Now;

            SQLDataAccess.ExecuteNonQuery(
                @"INSERT INTO [dbo].[WarmupLog] (Info, StartTime, EndTime)
                VALUES (@Info, @StartTime, @EndTime)",
                CommandType.Text,
                new SqlParameter("@Info", _log.Info.Reduce(500)),
                new SqlParameter("@StartTime", _log.StartTime),
                new SqlParameter("@EndTime", _log.EndTime)
            );
        }

        public static void Clear()
        {
            SQLDataAccess.ExecuteNonQuery(
                "DELETE FROM [dbo].[WarmupLog] WHERE StartTime < DATEADD(MONTH, -3, GETDATE())",
                CommandType.Text
            );
        }
    }
}
