using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using AdvantShop.Core.SQL;

namespace AdvantShop.Core.Services.Orders
{
    public sealed class OrderWarehouseService
    {
        private static object Sync = new object();
        
        public static void SaveOrderWarehouseIdsOnReserve(int orderId, List<int> warehouseIds)
        {
            if (warehouseIds == null || warehouseIds.Count == 0)
                return;
            
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Order].[Order_Warehouse]
                WHERE OrderId = @OrderId",
                CommandType.Text,
                new SqlParameter("@OrderId", orderId));

            SQLDataAccess.ExecuteNonQuery(
                @"INSERT INTO [Order].[Order_Warehouse] (OrderId, WarehouseId)
                SELECT @OrderId, ids.value
                FROM [Settings].[SPLIT_INT](@WarehouseIds, ',') as ids",
                CommandType.Text,
                new SqlParameter("@OrderId", orderId),
                new SqlParameter("@WarehouseIds", string.Join(",", warehouseIds)));
        }
        
        /// <summary>
        /// Пересчет складов заказ на основе перераспределения
        /// </summary>
        public static void ReSaveOrderWarehouseIdsByDistributions(int orderId)
        {
            lock (Sync)
            {
                SQLDataAccess.ExecuteNonQuery(
                    "Delete From [Order].[Order_Warehouse] Where OrderId = @OrderId;",
                    CommandType.Text,
                    new SqlParameter("@OrderId", orderId));

                SQLDataAccess.ExecuteNonQuery(
                    @"Insert Into [Order].[Order_Warehouse] (WarehouseId, OrderId)  
                Select distinct woi.WarehouseId, @OrderId 
                From [Order].[WarehouseOrderItem] woi
                Inner Join [Order].[OrderItems] oi on oi.OrderID = @OrderId and oi.[OrderItemID] = woi.[OrderItemId] 
                Where woi.Amount > 0",
                    CommandType.Text,
                    new SqlParameter("@OrderId", orderId));
            }
        }

        public static List<int> GetOrderWarehouseIds(int orderId)
        {
            return SQLDataAccess
                .Query<int>("Select WarehouseId From [Order].[Order_Warehouse] Where OrderId = @orderId",
                    new { orderId }).ToList();
        }
        
        public static List<string> GetWarehouseEmailsByOrderWarehouseIds(int orderId)
        {
            return SQLDataAccess
                .Query<string>(
                    "Select w.Email From [Catalog].[Warehouse] w "+ 
                        "Inner Join [Order].[Order_Warehouse] ow on ow.WarehouseId = w.Id and OrderId = @orderId",
                    new { orderId })
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct().ToList();
        }
    }
}