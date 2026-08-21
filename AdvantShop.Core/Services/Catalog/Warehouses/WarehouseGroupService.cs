using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;

namespace AdvantShop.Core.Services.Catalog.Warehouses
{
    public sealed class WarehouseGroupService
    {
        #region CRUD

        public static int Add(WarehouseGroup warehouseGroup)
        {
            warehouseGroup.Id = SQLDataAccess.ExecuteScalar<int>(
                @"INSERT INTO [Catalog].[WarehouseGroup]
	                ([ExternalId], [Name], Enabled, [Description], [SortOrder], [Phone], [CountryId], [RegionId], [CityId], Vk, Facebook, Instagram, Twitter, Telegram, OkRu, Youtube, Zen, Rutube)
                VALUES
	                (@ExternalId, @Name, @Enabled, @Description, @SortOrder, @Phone, @CountryId, @RegionId, @CityId, @Vk, @Facebook, @Instagram, @Twitter, @Telegram, @OkRu, @Youtube, @Zen, @Rutube);

                DECLARE @Id int = SCOPE_IDENTITY();
	            if @ExternalId is null
		        begin
			        UPDATE [Catalog].[WarehouseGroup] SET [ExternalId] = @Id WHERE [Id] = @Id
		        end
	            Select @Id;",
                CommandType.Text,
                new SqlParameter("@ExternalId", warehouseGroup.ExternalId ?? (object)DBNull.Value),
                new SqlParameter("@Name", warehouseGroup.Name),
                new SqlParameter("@Enabled", warehouseGroup.Enabled),
                new SqlParameter("@Description", warehouseGroup.Description ?? (object)DBNull.Value),
                new SqlParameter("@SortOrder", warehouseGroup.SortOrder),
                new SqlParameter("@Phone", warehouseGroup.Phone ?? (object)DBNull.Value),
                new SqlParameter("@CountryId", warehouseGroup.CountryId ?? (object)DBNull.Value),
                new SqlParameter("@RegionId", warehouseGroup.RegionId ?? (object)DBNull.Value),
                new SqlParameter("@CityId", warehouseGroup.CityId ?? (object)DBNull.Value),
                new SqlParameter("@Vk", warehouseGroup.Vk ?? (object)DBNull.Value),
                new SqlParameter("@Facebook", warehouseGroup.Facebook ?? (object)DBNull.Value),
                new SqlParameter("@Instagram", warehouseGroup.Instagram ?? (object)DBNull.Value),
                new SqlParameter("@Twitter", warehouseGroup.Twitter ?? (object)DBNull.Value),
                new SqlParameter("@Telegram", warehouseGroup.Telegram ?? (object)DBNull.Value),
                new SqlParameter("@OkRu", warehouseGroup.OkRu ?? (object)DBNull.Value),
                new SqlParameter("@Youtube", warehouseGroup.Youtube ?? (object)DBNull.Value),
                new SqlParameter("@Zen", warehouseGroup.Zen ?? (object)DBNull.Value),
                new SqlParameter("@Rutube", warehouseGroup.Rutube ?? (object)DBNull.Value)
            );

            return warehouseGroup.Id;
        }

        public static void Update(WarehouseGroup warehouseGroup)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [Catalog].[WarehouseGroup]
                   SET [ExternalId] = @ExternalId
                      ,[Name] = @Name
                      ,[Enabled] = @Enabled
                      ,[Description] = @Description
                      ,[SortOrder] = @SortOrder
                      ,[Phone] = @Phone
                      ,[CountryId] = @CountryId
                      ,[RegionId] = @RegionId
                      ,[CityId] = @CityId
                      ,Vk = @Vk
                      ,Facebook = @Facebook
                      ,Instagram = @Instagram
                      ,Twitter = @Twitter
                      ,Telegram = @Telegram
                      ,OkRu = @OkRu
                      ,Youtube = @Youtube
                      ,Zen = @Zen
                      ,Rutube = @Rutube
                 WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", warehouseGroup.Id),
                new SqlParameter("@ExternalId", warehouseGroup.ExternalId ?? (object)DBNull.Value),
                new SqlParameter("@Name", warehouseGroup.Name),
                new SqlParameter("@Enabled", warehouseGroup.Enabled),
                new SqlParameter("@Description", warehouseGroup.Description ?? (object)DBNull.Value),
                new SqlParameter("@SortOrder", warehouseGroup.SortOrder),
                new SqlParameter("@Phone", warehouseGroup.Phone ?? (object)DBNull.Value),
                new SqlParameter("@CountryId", warehouseGroup.CountryId ?? (object)DBNull.Value),
                new SqlParameter("@RegionId", warehouseGroup.RegionId ?? (object)DBNull.Value),
                new SqlParameter("@CityId", warehouseGroup.CityId ?? (object)DBNull.Value),
                new SqlParameter("@Vk", warehouseGroup.Vk ?? (object)DBNull.Value),
                new SqlParameter("@Facebook", warehouseGroup.Facebook ?? (object)DBNull.Value),
                new SqlParameter("@Instagram", warehouseGroup.Instagram ?? (object)DBNull.Value),
                new SqlParameter("@Twitter", warehouseGroup.Twitter ?? (object)DBNull.Value),
                new SqlParameter("@Telegram", warehouseGroup.Telegram ?? (object)DBNull.Value),
                new SqlParameter("@OkRu", warehouseGroup.OkRu ?? (object)DBNull.Value),
                new SqlParameter("@Youtube", warehouseGroup.Youtube ?? (object)DBNull.Value),
                new SqlParameter("@Zen", warehouseGroup.Zen ?? (object)DBNull.Value),
                new SqlParameter("@Rutube", warehouseGroup.Rutube ?? (object)DBNull.Value)
            );
        }
        
        public static WarehouseGroup Get(int id)
        {
            return SQLDataAccess.ExecuteReadOne(
                "SELECT TOP 1 * FROM [Catalog].[WarehouseGroup] WHERE [Id] = @Id",
                CommandType.Text, 
                GetFromReader, 
                new SqlParameter("@Id", id));
        }
        
        public static List<WarehouseGroup> GetList(bool onlyEnabled = true)
        {
            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Catalog].[WarehouseGroup] " + 
                (onlyEnabled ? "Where Enabled = 1" : "") + 
                " Order by SortOrder",
                CommandType.Text, 
                GetFromReader);
        }
  
        public static void Delete(int id)
        {
            SQLDataAccess.ExecuteNonQuery(
                "DELETE FROM [Catalog].[WarehouseGroup] WHERE [Id] = @Id",
                CommandType.Text, 
                new SqlParameter("@Id", id));
        }
     
        public static WarehouseGroup GetFromReader(SqlDataReader reader)
        {
            return new WarehouseGroup
            {
                Id = SQLDataHelper.GetInt(reader, "Id"),
                ExternalId = SQLDataHelper.GetString(reader, "ExternalId"),
                Name = SQLDataHelper.GetString(reader, "Name"),
                Enabled = SQLDataHelper.GetBoolean(reader, "Enabled"),
                Description = SQLDataHelper.GetString(reader, "Description", null),
                SortOrder = SQLDataHelper.GetInt(reader, "SortOrder"),
                Phone = SQLDataHelper.GetString(reader, "Phone", null),
                CountryId = SQLDataHelper.GetNullableInt(reader, "CountryId"),
                RegionId = SQLDataHelper.GetNullableInt(reader, "RegionId"),
                CityId = SQLDataHelper.GetNullableInt(reader, "CityId"),
                Vk = SQLDataHelper.GetString(reader, "Vk", null),
                Facebook = SQLDataHelper.GetString(reader, "Facebook", null),
                Instagram = SQLDataHelper.GetString(reader, "Instagram", null),
                Twitter = SQLDataHelper.GetString(reader, "Twitter", null),
                Telegram = SQLDataHelper.GetString(reader, "Telegram", null),
                OkRu = SQLDataHelper.GetString(reader, "OkRu", null),
                Youtube = SQLDataHelper.GetString(reader, "Youtube", null),
                Zen = SQLDataHelper.GetString(reader, "Zen", null),
                Rutube = SQLDataHelper.GetString(reader, "Rutube", null),
            };
        }

        #endregion
        
        #region CRUD WarehouseGroup_Warehouse
        
        public static void AddWarehouseToGroup(int warehouseGroupId, int warehouseId, int sortOrder)
        {
            SQLDataAccess.ExecuteScalar<int>(
                @"INSERT INTO [Catalog].[WarehouseGroup_Warehouse] (WarehouseGroupId, WarehouseId, SortOrder) VALUES (@WarehouseGroupId, @WarehouseId, @SortOrder)",
                CommandType.Text,
                new SqlParameter("@WarehouseGroupId", warehouseGroupId),
                new SqlParameter("@WarehouseId", warehouseId),
                new SqlParameter("@SortOrder", sortOrder)
            );
        }
        
        public static void DeleteWarehouseFromGroup(int warehouseGroupId, int warehouseId)
        {
            SQLDataAccess.ExecuteScalar<int>(
                @"Delete from [Catalog].[WarehouseGroup_Warehouse] Where WarehouseGroupId = @WarehouseGroupId and WarehouseId = @WarehouseId",
                CommandType.Text,
                new SqlParameter("@WarehouseGroupId", warehouseGroupId),
                new SqlParameter("@WarehouseId", warehouseId)
            );
        }
        
        public static void DeleteAllWarehousesFromGroup(int warehouseGroupId)
        {
            SQLDataAccess.ExecuteScalar<int>(
                @"Delete from [Catalog].[WarehouseGroup_Warehouse] Where WarehouseGroupId = @WarehouseGroupId",
                CommandType.Text,
                new SqlParameter("@WarehouseGroupId", warehouseGroupId)
            );
        }

        public static List<int> GetWarehouseIds(int warehouseGroupId)
        {
            return SQLDataAccess
                .Query<int>("Select WarehouseId From [Catalog].[WarehouseGroup_Warehouse] Where WarehouseGroupId = @warehouseGroupId Order by SortOrder",
                    new { warehouseGroupId })
                .ToList();
        }
        
        public static List<Warehouse> GetWarehouses(int warehouseGroupId)
        {
            return SQLDataAccess.ExecuteReadList(
                @"Select w.* 
                From [Catalog].[WarehouseGroup_Warehouse] g 
                Inner Join [Catalog].[Warehouse] w on w.Id = g.WarehouseId 
                Where g.WarehouseGroupId = @WarehouseGroupId 
                Order by g.SortOrder",
                CommandType.Text,
                WarehouseService.GetFromReader,
                new SqlParameter("@WarehouseGroupId", warehouseGroupId)
            );
        }
        
        #endregion
        
        
    }
}