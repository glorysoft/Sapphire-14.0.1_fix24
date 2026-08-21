using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;

namespace AdvantShop.Core.Services.Shipping.Rules
{
    public class RuleRepository
    {
        public static RuleDto CreateFromReader(SqlDataReader reader)
        {
            return new RuleDto
            {
                Id = SQLDataHelper.GetInt(reader, "Id"),
                Name = SQLDataHelper.GetString(reader, "Name"),
                Enabled = SQLDataHelper.GetBoolean(reader, "Enabled"),
                SortOrder = SQLDataHelper.GetInt(reader, "SortOrder"),
                EditorsParams = SQLDataHelper.GetString(reader, "EditorsParams"),
                FiltersParams = SQLDataHelper.GetString(reader, "FiltersParams"),
            };
        }

        public static RuleDto Get(int id)
            => SQLDataAccess.ExecuteReadOne(
                "SELECT * FROM [Order].[ShippingRule] WHERE [Id] = @Id",
                CommandType.Text,
                CreateFromReader,
                new SqlParameter("@Id", id));
        
        public static List<RuleDto> GetAll(bool? enabled = null)
            => SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Order].[ShippingRule]" +
                (enabled.HasValue ? " WHERE [Enabled] = @Enabled" : string.Empty) +
                " ORDER BY [SortOrder] ASC",
                CommandType.Text,
                CreateFromReader,
                new SqlParameter("@Enabled", enabled ?? (object)DBNull.Value));

        public static int Add(RuleDto ruleDto)
        {
            ruleDto.Id =
                SQLDataAccess.ExecuteScalar<int>(
                    @"INSERT INTO [Order].[ShippingRule]
                           ([Name]
                           ,[Enabled]
                           ,[SortOrder]
                           ,[EditorsParams]
                           ,[FiltersParams]
                           ,[DateAdded]
                           ,[DateModified])
                     VALUES
                       (@Name
                       ,@Enabled
                       ,@SortOrder
                       ,@EditorsParams
                       ,@FiltersParams
                       ,@DateAdded
                       ,@DateModified);
                    SELECT scope_identity();",
                    CommandType.Text,
                    new SqlParameter("@Name", ruleDto.Name ?? (object)DBNull.Value),
                    new SqlParameter("@Enabled", ruleDto.Enabled),
                    new SqlParameter("@SortOrder", ruleDto.SortOrder),
                    new SqlParameter("@EditorsParams", ruleDto.EditorsParams ?? (object)DBNull.Value),
                    new SqlParameter("@FiltersParams", ruleDto.FiltersParams ?? (object)DBNull.Value),
                    new SqlParameter("@DateAdded", DateTime.Now),
                    new SqlParameter("@DateModified", DateTime.Now));

            return ruleDto.Id;
        }

        public static void Update(RuleDto ruleDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [Order].[ShippingRule]
                   SET [Name] = @Name
                      ,[Enabled] = @Enabled
                      ,[SortOrder] = @SortOrder
                      ,[EditorsParams] = @EditorsParams
                      ,[FiltersParams] = @FiltersParams
                      ,[DateModified] = @DateModified
                 WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", ruleDto.Id),
                new SqlParameter("@Name", ruleDto.Name ?? (object)DBNull.Value),
                new SqlParameter("@Enabled", ruleDto.Enabled),
                new SqlParameter("@SortOrder", ruleDto.SortOrder),
                new SqlParameter("@EditorsParams", ruleDto.EditorsParams ?? (object)DBNull.Value),
                new SqlParameter("@FiltersParams", ruleDto.FiltersParams ?? (object)DBNull.Value),
                new SqlParameter("@DateModified", DateTime.Now));
        }

        public static void SetActive(int id, bool active)
        {
            SQLDataAccess.ExecuteNonQuery(
                "Update [Order].[ShippingRule] Set [Enabled] = @Enabled, [DateModified] = @DateModified Where [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", id),
                new SqlParameter("@Enabled", active),
                new SqlParameter("@DateModified", DateTime.Now));
        }

        public static void Delete(int id)
        {
            SQLDataAccess.ExecuteNonQuery(
                "DELETE FROM [Order].[ShippingRule] WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", id));
        }
    }
}