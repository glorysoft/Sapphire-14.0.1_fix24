using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Core.Caching;
using AdvantShop.Core.SQL;

namespace AdvantShop.Core.Services.Shipping
{
    public static class ShippingWarehouseMappingService
    {
        private const string ShippingWarehouseActiveCacheKey = "ShippingWarehouse_Active";
        
        private static bool IsActive() => 
            CacheManager.Get(ShippingWarehouseActiveCacheKey, () => SQLDataAccess.ExecuteScalar<bool>(
                @"SELECT CAST(CASE
                    WHEN EXISTS (SELECT 1 FROM [Order].[ShippingWarehouse])
                    THEN 1
                    ELSE 0
                END AS BIT)",
                CommandType.Text
            ));
        
        public static void Add(int methodId, int warehouseId)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"IF NOT EXISTS (SELECT * FROM [Order].[ShippingWarehouse] WHERE [MethodId] = @MethodId AND [WarehouseId] = @WarehouseId)
                BEGIN
                    INSERT INTO [Order].[ShippingWarehouse] ([MethodId],  [WarehouseId]) Values (@MethodId, @WarehouseId)
                END",
                CommandType.Text,
                new SqlParameter("@MethodId", methodId),
                new SqlParameter("@WarehouseId", warehouseId));
            
            CacheManager.Remove(ShippingWarehouseActiveCacheKey);
        }

        public static void Delete(int methodId, int warehouseId)
        {
            SQLDataAccess.ExecuteNonQuery(
                "DELETE FROM [Order].[ShippingWarehouse] WHERE [MethodId] = @MethodId AND [WarehouseId] = @WarehouseId",
                CommandType.Text,
                new SqlParameter("@MethodId", methodId),
                new SqlParameter("@WarehouseId", warehouseId));
            
            CacheManager.Remove(ShippingWarehouseActiveCacheKey);
        }

        public static List<int> GetByMethod(int methodId)
        {
            if (!IsActive())
                return new List<int>();
            
            return SQLDataAccess.ExecuteReadColumn<int>(
                @"SELECT [ShippingWarehouse].[WarehouseId] 
                FROM [Order].[ShippingWarehouse] 
                      INNER JOIN [Catalog].[Warehouse] ON [Warehouse].[Id] = [ShippingWarehouse].[WarehouseId] 
                WHERE [MethodId] = @MethodId
                ORDER BY [Warehouse].[SortOrder]",
                CommandType.Text,
                "WarehouseId",
                new SqlParameter("@MethodId", methodId));
        }
    }
}