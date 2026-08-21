using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using AdvantShop.Core.Caching;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;

namespace AdvantShop.Core.Services.Landing.LandingEmails
{
    public class LandingDeferredEmailService
    {
        private const string LandingDeferredEmailActiveCacheKey = "LandingDeferredEmail_Active";

        private static bool IsActive() =>
            CacheManager.Get(LandingDeferredEmailActiveCacheKey, () => SQLDataAccess.ExecuteScalar<bool>(
                @"SELECT CAST(CASE
                    WHEN EXISTS (SELECT 1 FROM [CMS].[LandingDeferredEmail])
                    THEN 1
                    ELSE 0
                END AS BIT)",
                CommandType.Text
            ));

        public List<LandingDeferredEmail> GetList(DateTime date)
        {
            if (!IsActive())
                return new List<LandingDeferredEmail>();

            return SQLDataAccess.ExecuteReadList(
                @"SELECT * 
                FROM [CMS].[LandingDeferredEmail] 
                WHERE [SendingDate] <= @date",
                CommandType.Text,
                reader => new LandingDeferredEmail
                {
                    Id = SQLDataHelper.GetInt(reader, "Id"),
                    CustomerId = SQLDataHelper.GetGuid(reader, "CustomerId"),
                    Email = SQLDataHelper.GetString(reader, "Email"),
                    Subject = SQLDataHelper.GetString(reader, "Subject"),
                    Body = SQLDataHelper.GetString(reader, "Body"),
                    SendingDate = SQLDataHelper.GetDateTime(reader, "SendingDate")
                },
                new SqlParameter("@date", date)
            );
        }

        public int Add(LandingDeferredEmail email)
        {
            email.Id = SQLDataAccess.ExecuteScalar<int>(
                @"INSERT INTO [CMS].[LandingDeferredEmail] ([CustomerId],[Email],[Subject],[Body],[SendingDate]) 
                VALUES (@CustomerId,@Email,@Subject,@Body,@SendingDate); 

                SELECT SCOPE_IDENTITY();",
                CommandType.Text,
                new SqlParameter("@CustomerId", email.CustomerId),
                new SqlParameter("@Email", email.Email),
                new SqlParameter("@Subject", email.Subject ?? ""),
                new SqlParameter("@Body", email.Body ?? ""),
                new SqlParameter("@SendingDate", email.SendingDate)
            );
            
            CacheManager.Remove(LandingDeferredEmailActiveCacheKey);

            return email.Id;
        }

        public void Delete(int id)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [CMS].[LandingDeferredEmail] 
                WHERE [Id] = @id", 
                CommandType.Text,
                new SqlParameter("@id", id)
            );
            
            CacheManager.Remove(LandingDeferredEmailActiveCacheKey);
        }
    }
}
