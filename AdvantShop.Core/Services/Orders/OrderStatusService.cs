//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Crm.BusinessProcesses;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Core.Services.Smses;
using AdvantShop.Core.Services.Triggers;
using AdvantShop.Core.SQL;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.SEO;

namespace AdvantShop.Orders
{
    public class OrderStatusService
    {
        private const string OrderStatusCachePrefix = "OrderStatus_";
        
        public static int DefaultOrderStatus
        {
            get
            {
                return CacheManager.Get(OrderStatusCachePrefix + "DefaultOrderStatus",
                    () =>
                        SQLDataAccess.ExecuteScalar<int>(
                            "SELECT OrderStatusID FROM [Order].[OrderStatus] WHERE [IsDefault] = 'True'",
                            CommandType.Text));
            }
        }

        public static int CanceledOrderStatus
        {
            get
            {
                return CacheManager.Get(OrderStatusCachePrefix + "CanceledOrderStatus",
                    () =>
                        SQLDataAccess.ExecuteScalar<int>(
                            "SELECT top(1) OrderStatusID FROM [Order].[OrderStatus] WHERE [IsCanceled] = 'True'",
                            CommandType.Text));
            }
        }

        public static bool StatusCanBeDeleted(int statusId)
        {
            if (statusId == DefaultOrderStatus)
                return false;
            return GetOrderCountByStatusId(statusId) <= 0;
        }

        public static int GetOrderCountByStatusId(object statusId, List<int> warehouseIds = null, int? managerId = null)
        {
            var sql =
                "SELECT COUNT(*) " +
                "FROM [Order].[Order] " +
                "WHERE [OrderStatusID] = @StatusID and IsDraft = 0";
            
            var sqlParams = new List<SqlParameter>() { new SqlParameter("@StatusID", statusId) };
            
            var warehousesParams = warehouseIds?.Select(x => new SqlParameter("@w" + x, x)).ToList();
            if (warehousesParams != null && warehousesParams.Count > 0)
            {
                sql +=
                    " and Exists (Select 1 " +
                    "             From [Order].[Order_Warehouse] ow " +
                    "             Where ow.OrderId = [Order].[OrderId] and ow.WarehouseId in (" +
                    string.Join(",", warehousesParams.Select(x => x.ParameterName)) + ")) ";
                
                sqlParams.AddRange(warehousesParams);
            }
            
            if (managerId != null)
            {
                switch (SettingsManager.ManagersOrderConstraint)
                {
                    case ManagersOrderConstraint.Assigned:
                        sql += " and [Order].ManagerId = @ManagerId ";
                        break;
                    case ManagersOrderConstraint.AssignedAndFree:
                        sql += " and ([Order].ManagerId = @ManagerId or [Order].ManagerId is null) ";
                        break;
                }

                sqlParams.Add(new SqlParameter("@ManagerId", managerId.Value));
            }

            return SQLDataAccess.ExecuteScalar<int>(sql, CommandType.Text, sqlParams.ToArray());
        }

        public static int GetOrderCountByPaymentStatus(bool isPaid, List<int> warehouseIds = null, int? managerId = null)
        {
            var sql =
                "SELECT COUNT(*) " +
                "FROM [Order].[Order] " +
                "WHERE IsDraft = 0 " +
                (isPaid ? " and PaymentDate is not null " : " and PaymentDate is null ");
         
            var sqlParams = new List<SqlParameter>();
            
            var warehousesParams = warehouseIds?.Select(x => new SqlParameter("@w" + x, x)).ToList();
            if (warehousesParams != null && warehousesParams.Count > 0)
            {
                sql +=
                    " and Exists (Select 1 " +
                    "             From [Order].[Order_Warehouse] ow " +
                    "             Where ow.OrderId = [Order].[OrderId] and ow.WarehouseId in (" +
                    string.Join(",", warehousesParams.Select(x => x.ParameterName)) + ")) ";
                
                sqlParams.AddRange(warehousesParams);
            }

            if (managerId != null)
            {
                switch (SettingsManager.ManagersOrderConstraint)
                {
                    case ManagersOrderConstraint.Assigned:
                        sql += " and [Order].ManagerId = @ManagerId ";
                        break;
                    case ManagersOrderConstraint.AssignedAndFree:
                        sql += " and ([Order].ManagerId = @ManagerId or [Order].ManagerId is null) ";
                        break;
                }

                sqlParams.Add(new SqlParameter("@ManagerId", managerId.Value));
            }

            return SQLDataAccess.ExecuteScalar<int>(sql, CommandType.Text, sqlParams.ToArray());
        }
        
        public static List<OrderStatus> GetOrderCountByStatusAndShowInMenu(List<int> warehouseIds = null, int? managerId = null)
        {
            var sql =
                "Select Count(OrderId) From [Order].[Order] WHERE IsDraft = 0 and OrderStatusID = [OrderStatus].OrderStatusID";
            
            var sqlParams = new List<SqlParameter>();
            
            var warehousesParams = warehouseIds?.Select(x => new SqlParameter("@w" + x, x)).ToList();
            if (warehousesParams != null && warehousesParams.Count > 0)
            {
                sql +=
                    " and Exists (Select 1 " +
                    "             From [Order].[Order_Warehouse] ow " +
                    "             Where ow.OrderId = [Order].[OrderId] and ow.WarehouseId in (" +
                    string.Join(",", warehousesParams.Select(x => x.ParameterName)) + ")) ";
                
                sqlParams.AddRange(warehousesParams);
            }

            if (managerId != null)
            {
                switch (SettingsManager.ManagersOrderConstraint)
                {
                    case ManagersOrderConstraint.Assigned:
                        sql += " and [Order].ManagerId = @ManagerId ";
                        break;
                    case ManagersOrderConstraint.AssignedAndFree:
                        sql += " and ([Order].ManagerId = @ManagerId or [Order].ManagerId is null) ";
                        break;
                }

                sqlParams.Add(new SqlParameter("@ManagerId", managerId.Value));
            }

            return SQLDataAccess.ExecuteReadList(
                "SELECT OrderStatusID, (" + sql + ") as CountOrder " +
                "FROM [Order].[OrderStatus] " + 
                "WHERE ShowInMenu = 1",
                CommandType.Text,
                reader => new OrderStatus
                {
                    CountOrdersInStatus = SQLDataHelper.GetInt(reader, "CountOrder"),
                    StatusID = SQLDataHelper.GetInt(reader, "OrderStatusID")
                },
                sqlParams.ToArray());
        }

        public static int GetCountDraftOrder(int? managerId = null)
        {
            var sql = "SELECT COUNT(*) FROM [Order].[Order] WHERE IsDraft = 1";
            var sqlParams = new List<SqlParameter>();
            
            if (managerId != null)
            {
                switch (SettingsManager.ManagersOrderConstraint)
                {
                    case ManagersOrderConstraint.Assigned:
                        sql += " and [Order].ManagerId = @ManagerId ";
                        break;
                    case ManagersOrderConstraint.AssignedAndFree:
                        sql += " and ([Order].ManagerId = @ManagerId or [Order].ManagerId is null) ";
                        break;
                }

                sqlParams.Add(new SqlParameter("@ManagerId", managerId.Value));
            }
            
            return SQLDataAccess.ExecuteScalar<int>(sql, CommandType.Text, sqlParams.ToArray());
        }

        public static int GetOrderCountByStatusIdAndManagerId(object statusId, int? managerId)
        {
            return SQLDataAccess.ExecuteScalar<int>(
                "SELECT COUNT(*) FROM [Order].[Order] WHERE [Order].[Order].[OrderStatusID] = @StatusID AND [Order].[Order].ManagerId = @managerId and IsDraft=0",
                CommandType.Text,
                new SqlParameter("@StatusID", statusId),
                new SqlParameter("@managerId", managerId));
        }


        public static List<OrderStatus> GetOrderStatuses()
        {
            return SQLDataAccess.ExecuteReadList("SELECT * FROM [Order].OrderStatus Order By SortOrder", CommandType.Text,
                                                 GetOrderStatusFromReader);
        }

        private static OrderStatus GetOrderStatusFromReader(SqlDataReader reader)
        {
            return new OrderStatus
            {
                StatusID = SQLDataHelper.GetInt(reader, "OrderStatusID"),
                StatusName = SQLDataHelper.GetString(reader, "StatusName"),
                Command = (OrderStatusCommand) SQLDataHelper.GetInt(reader, "CommandID"),
                IsCanceled = SQLDataHelper.GetBoolean(reader, "IsCanceled"),
                IsDefault = SQLDataHelper.GetBoolean(reader, "IsDefault"),
                IsCompleted = SQLDataHelper.GetBoolean(reader, "IsCompleted"),
                Color = SQLDataHelper.GetString(reader, "Color"),
                SortOrder = SQLDataHelper.GetInt(reader, "SortOrder"),
                Hidden = SQLDataHelper.GetBoolean(reader, "Hidden"),
                CancelForbidden = SQLDataHelper.GetBoolean(reader, "CancelForbidden"),
                ShowInMenu = SQLDataHelper.GetBoolean(reader, "ShowInMenu"),
                ChangePaymentForbidden = SQLDataHelper.GetBoolean(reader, "ChangePaymentForbidden")
            };
        }

        public static string GetStatusName(int idStatus)
        {
            return SQLDataAccess.ExecuteScalar<string>(
                "SELECT StatusName FROM [Order].[OrderStatus]  WHERE OrderStatusID = @OrderStatusID",
                CommandType.Text, new SqlParameter("OrderStatusID", idStatus));
        }

        public static void ChangeOrderStatusForNewOrder(int orderId, string basis = null)
        {
            var statusId = GetOrderStatusId(orderId);

            if (statusId != 0 && statusId != DefaultOrderStatus) 
                return;

            ChangeOrderStatus(orderId, DefaultOrderStatus,
                !string.IsNullOrEmpty(basis)
                    ? basis
                    : LocalizationService.GetResource("Core.OrderStatus.Created"),
                false);
        }

        public static void ChangeOrderStatus(int orderId, int statusId, string basis, bool updateModules = true, bool isDraftChanged = false)
        {
            var order = OrderService.GetOrder(orderId);

            if (order == null)
                throw new Exception("Order is null");

            var newStatus = GetOrderStatus(statusId);

            if (newStatus == null)
                throw new Exception("Status is null");

            var prevStatus = order.OrderStatus;
            if (prevStatus != null && prevStatus.StatusID == newStatus.StatusID && !newStatus.IsDefault && !isDraftChanged)
                return;

            var user = CustomerContext.CurrentCustomer ?? new Customer();

            var history = new OrderStatusHistory()
            {
                OrderID = orderId,
                CustomerID = user.IsAdmin || user.IsManager || user.IsModerator ? user.Id : (Guid?)null,
                CustomerName = user.IsAdmin || user.IsManager || user.IsModerator ? user.FirstName + " " + user.LastName : string.Empty,
                PreviousStatus = prevStatus != null ? prevStatus.StatusName : string.Empty,
                NewStatus = newStatus.StatusName,
                Basis = basis
            };

            if (prevStatus != null && !prevStatus.Hidden && !order.IsDraft)
            {
                SQLDataAccess.ExecuteNonQuery(
                    @"Update [Order].[Order] 
                    Set PreviousStatus = @PreviousStatus, PreviousStatusId = @PreviousStatusId 
                    Where OrderId=@OrderId",
                    CommandType.Text,
                    new SqlParameter("@PreviousStatus", prevStatus.StatusName),
                    new SqlParameter("@PreviousStatusId", prevStatus.StatusID),
                    new SqlParameter("@OrderId", orderId));
            }

            var command = ChangeOrderStatusInDb(orderId, statusId);

            if (order.IsDraft)
                return;

            AddOrderStatusHistory(history);

            order.OrderStatusId = statusId;
            order.OrderStatus = null;

            if (SettingsCheckout.DecrementProductsCount && !order.IsDraft && command != null)
            {
                if (command == (int)OrderStatusCommand.Increment)
                {
                    RedistributeStocksService.Redistribute(order);
                    OrderService.IncrementProductsCountAccordingOrder(order, history);
                }
                else if (command == (int)OrderStatusCommand.Decrement)
                {
                    RedistributeStocksService.Redistribute(order);
                    OrderService.DecrementProductsCountAccordingOrder(order, history);
                }
            }

            var changedToCanceled = (prevStatus == null || !prevStatus.IsCanceled) && newStatus.IsCanceled;
            var changedFromCanceled = prevStatus != null && prevStatus.IsCanceled && !newStatus.IsCanceled;

            if (changedToCanceled) 
                BonusSystem.RollbackPurchase(order);
                
            if (changedFromCanceled)
            {
                BonusSystem.RestorePurchase(order);
                if (order.Payed)
                    BonusSystem.ConfirmPurchase(order);
            }
            
            if ((changedToCanceled || changedFromCanceled)
                && order.Coupon != null && order.Coupon.Code.IsNotEmpty())
            {
                var coupon = CouponService.GetCouponByCode(order.Coupon.Code);
                if (coupon != null)
                    if (changedToCanceled)
                        CouponService.DecrementActualUses(coupon.CouponID);
                    else
                        CouponService.IncrementActualUses(coupon.CouponID);
            }

            OrderHistoryService.ChangingStatus(history);

            if (updateModules)
                ModulesExecuter.OrderChangeStatus(orderId);

            GoogleAnalyticsService.SendOrder(order);

            BizProcessExecuter.OrderStatusChanged(order);
            Core.Services.Api.ApiWebhookExecuter.OrderStatusChanged(order);
            TriggerProcessService.ProcessEvent(ETriggerEventType.OrderStatusChanged, order);
        }

        private static int? ChangeOrderStatusInDb(int orderId, int statusId)
        {
            return SQLDataHelper.GetInt(SQLDataAccess.ExecuteScalar("[Order].[sp_GetChangeOrderStatus]", CommandType.StoredProcedure,
                                                         new SqlParameter("@OrderID", orderId),
                                                         new SqlParameter("@OrderStatusID", statusId)));
        }

        public static int AddOrderStatus(OrderStatus status)
        {
            status.StatusID =
                SQLDataAccess.ExecuteScalar<int>("[Order].[sp_AddOrderStatus]", CommandType.StoredProcedure,
                    new SqlParameter("@OrderStatusID", status.StatusID),
                    new SqlParameter("@StatusName", status.StatusName),
                    new SqlParameter("@CommandID", (int) status.Command),
                    new SqlParameter("@IsDefault", status.IsDefault),
                    new SqlParameter("@IsCanceled", status.IsCanceled),
                    new SqlParameter("@Hidden", status.Hidden),
                    new SqlParameter("@IsCompleted", status.IsCompleted),
                    new SqlParameter("@Color", status.Color.IsNotEmpty() ? status.Color : (object) DBNull.Value),
                    new SqlParameter("@SortOrder", status.SortOrder),
                    new SqlParameter("@CancelForbidden", status.CancelForbidden),
                    new SqlParameter("@ShowInMenu", status.ShowInMenu),
                    new SqlParameter("@ChangePaymentForbidden", status.ChangePaymentForbidden)
                );
            
            CacheManager.RemoveByPattern(OrderStatusCachePrefix);

            return status.StatusID;
        }

        public static void UpdateOrderStatus(OrderStatus status)
        {
            SQLDataAccess.ExecuteNonQuery("[Order].[sp_UpdateOrderStatus]", CommandType.StoredProcedure,
                new SqlParameter("@OrderStatusID", status.StatusID),
                new SqlParameter("@StatusName", status.StatusName),
                new SqlParameter("@CommandID", (int) status.Command),
                new SqlParameter("@IsDefault", status.IsDefault),
                new SqlParameter("@IsCanceled", status.IsCanceled),
                new SqlParameter("@Hidden", status.Hidden),
                new SqlParameter("@IsCompleted", status.IsCompleted),
                new SqlParameter("@Color", status.Color.IsNotEmpty() ? status.Color : (object) DBNull.Value),
                new SqlParameter("@SortOrder", status.SortOrder),
                new SqlParameter("@CancelForbidden", status.CancelForbidden),
                new SqlParameter("@ShowInMenu", status.ShowInMenu),
                new SqlParameter("@ChangePaymentForbidden", status.ChangePaymentForbidden)
                );
            
            CacheManager.RemoveByPattern(OrderStatusCachePrefix);
        }


        public static bool DeleteOrderStatus(int orderStatusId)
        {
            if (!StatusCanBeDeleted(orderStatusId))
                return false;

            var result = 
                SQLDataAccess.ExecuteScalar<int>(
                "[Order].[sp_DeleteOrderStatus]",
                CommandType.StoredProcedure,
                new SqlParameter("@OrderStatusID", orderStatusId)) == 1;
            
            CacheManager.RemoveByPattern(OrderStatusCachePrefix);

            return result;
        }

        public static OrderStatus GetOrderStatus(int orderStatusId)
        {
            return
                    SQLDataAccess.ExecuteReadOne(
                        "SELECT TOP 1 * FROM [Order].[OrderStatus] WHERE [OrderStatusID] = @OrderStatusID",
                        CommandType.Text,
                        GetOrderStatusFromReader,
                        new SqlParameter("@OrderStatusID", orderStatusId));
        }

        public static int GetOrderStatusId(int orderId)
        {
            return SQLDataAccess.ExecuteScalar<int>(
                "SELECT [OrderStatusID] FROM [Order].[Order] WHERE [OrderID] = @OrderID",
                CommandType.Text,
                new SqlParameter("@OrderID", orderId));
        }


        public static List<Order> GetOrdersByStatusId(int statusId)
        {
            return SQLDataAccess.ExecuteReadList<Order>(
                "SELECT * FROM [Order].[Order] WHERE [OrderStatusID] = @OrderStatusID",
                CommandType.Text,
                OrderService.GetOrderFromReader,
                new SqlParameter("@OrderStatusID", statusId));
        }

        public static List<Order> GetOrdersByStatusId(DateTime from, DateTime to, int? statusId = null)
        {
            var query = "SELECT * FROM [Order].[Order] WHERE ";
            var queryParams = new List<SqlParameter>();

            if (statusId != null && statusId != 0)
            {
                query += "[OrderStatusID] = @OrderStatusID and ";
                queryParams.Add(new SqlParameter("@OrderStatusID", statusId));
            }

            query += "[OrderDate] >= @From and [OrderDate] <= @To";
            queryParams.Add(new SqlParameter("@From", from));
            queryParams.Add(new SqlParameter("@To", to));

            return SQLDataAccess.ExecuteReadList(query, CommandType.Text, OrderService.GetOrderFromReader, queryParams.ToArray());
        }


        public static OrderStatus GetOrderStatusByName(string statusName)
        {
            return
                SQLDataAccess.ExecuteReadOne(
                    "SELECT TOP 1 * FROM [Order].[OrderStatus] WHERE LOWER ([StatusName]) = LOWER (@StatusName)",
                    CommandType.Text,
                    GetOrderStatusFromReader,
                    new SqlParameter("@StatusName", statusName));
        }


        public static void AddOrderStatusHistory(OrderStatusHistory history)
        {
            SQLDataAccess.ExecuteNonQuery(
                "Insert into [Order].StatusHistory (Date, OrderID, PreviousStatus, NewStatus, CustomerID, CustomerName, Basis) " +
                "values (GetDate(), @OrderID, @PreviousStatus, @NewStatus, @CustomerID, @CustomerName, @Basis)",
                CommandType.Text,
                new SqlParameter("@OrderID", history.OrderID),
                new SqlParameter("@PreviousStatus", history.PreviousStatus),
                new SqlParameter("@NewStatus", history.NewStatus),
                new SqlParameter("@CustomerID", history.CustomerID ?? (object)DBNull.Value),
                new SqlParameter("@CustomerName", history.CustomerName),
                new SqlParameter("@Basis", history.Basis ?? string.Empty)
                );
        }

        public static List<OrderStatusHistory> GetOrderStatusHistory(int orderId)
        {
            return SQLDataAccess.ExecuteReadList<OrderStatusHistory>(
                " Select * from [Order].StatusHistory where Orderid = @OrderID",
                CommandType.Text, GetOrderStatusHistoryFromReader,
                new SqlParameter("@OrderID", orderId)

                );
        }

        private static OrderStatusHistory GetOrderStatusHistoryFromReader(SqlDataReader reader)
        {
            return new OrderStatusHistory
            {
                Date = SQLDataHelper.GetDateTime(reader, "Date"),
                OrderID = SQLDataHelper.GetInt(reader, "OrderID"),
                PreviousStatus = SQLDataHelper.GetString(reader, "PreviousStatus"),
                NewStatus = SQLDataHelper.GetString(reader, "NewStatus"),
                CustomerID = SQLDataHelper.GetNullableGuid(reader, "CustomerID"),
                CustomerName = SQLDataHelper.GetString(reader, "CustomerName"),
                Basis = SQLDataHelper.GetString(reader, "Basis")
            };
        }
    }
}