using System;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL;
using AdvantShop.Diagnostics;
using AdvantShop.Helpers;
using AdvantShop.Orders;
using AdvantShop.Shipping.Sdek.Api;
using AdvantShop.Shipping.Sdek.DeliveryPoints;

namespace AdvantShop.Shipping.Sdek
{
    public partial class Sdek: IShippingWithBackgroundMaintenance
    {
        public void ExecuteJob()
        {
            if (_authLogin.IsNullOrEmpty()
                || _authPassword.IsNullOrEmpty())
                return;
            
            LoadSdekNumbers();
            SyncPickPoints(_sdekApiService20);
        }

        private void LoadSdekNumbers()
        {
            try
            {
                // получаем номер заказа сдэк для заказов, где его еще нет
                var list =
                    SQLDataAccess.ExecuteReadList(@"SELECT oad.* 
                    FROM [Order].[OrderAdditionalData] AS oad
                        INNER JOIN [Order].[Order] AS o ON o.[OrderID] = oad.[OrderID]
                        inner join [Order].[OrderStatus] os ON o.OrderStatusID = os.[OrderStatusID]
                    WHERE oad.[Name] = @KeyNameSdekOrderUuid AND o.OrderDate >= @MinOrderDate AND os.[IsCanceled] = 0 
                        AND os.[IsCompleted] = 0 AND o.[ShippingMethodID] = @ShippingMethodID 
                        AND NOT EXISTS(SELECT * FROM [Order].[OrderAdditionalData] AS oad2 WHERE oad2.[OrderID] = oad.[OrderID] AND oad2.[Name] = @KeyNameDispatchNumber)",
                        CommandType.Text,
                        reader => new Tuple<int, string>(SQLDataHelper.GetInt(reader, "OrderID"),
                            SQLDataHelper.GetString(reader, "Value")),
                        new SqlParameter("@ShippingMethodID", _method.ShippingMethodId),
                        new SqlParameter("@KeyNameSdekOrderUuid", KeyNameSdekOrderUuidInOrderAdditionalData),
                        new SqlParameter("@KeyNameDispatchNumber", KeyNameDispatchNumberInOrderAdditionalData),
                        new SqlParameter("@MinOrderDate", DateTime.Today.AddDays(-3)));

                foreach (var item in list)
                {
                    var orderId = item.Item1;
                    var sdekOrderUuid = item.Item2;

                    var order = OrderService.GetOrder(orderId);
                    if (order != null)
                    {
                        GetOrderResult orderResult = null;

                        if (sdekOrderUuid.IsNotEmpty())
                            orderResult = _sdekApiService20.GetOrder(sdekOrderUuid.TryParseGuid(), null, null);

                        if (orderResult?.Entity != null)
                        {
                            if (orderResult.Entity.CdekNumber.IsNotEmpty())
                            {
                                OrderService.AddUpdateOrderAdditionalData(
                                    order.OrderID,
                                    KeyNameDispatchNumberInOrderAdditionalData,
                                    orderResult.Entity.CdekNumber);
                                order.TrackNumber = orderResult.Entity.CdekNumber;
                                OrderService.UpdateOrderMain(order,
                                    changedBy: new OrderChangedBy("Получение трек-номеров СДЭК"));
                            }
                            else
                            {
                                var requestCreate = orderResult?.Requests?.FirstOrDefault(x => 
                                    string.Equals("CREATE", x.Type, StringComparison.OrdinalIgnoreCase));
                                if (requestCreate?.State.Equals("INVALID", StringComparison.OrdinalIgnoreCase) == true)
                                    OrderService.DeleteOrderAdditionalData(orderId, KeyNameSdekOrderUuidInOrderAdditionalData);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Warn(ex);
            }
        }

        public static void SyncPickPoints(SdekApiService20 _sdekApiService20)
        {
            // общая настройка, т.к. справочники общие, не зависят от настроек
            var lastDateSync = Configuration.SettingProvider.Items["SdekLastDateSyncPickPoints"].TryParseDateTime(true);
            try
            {
                var currentDateTime = DateTime.UtcNow;

                if (!lastDateSync.HasValue || (currentDateTime - lastDateSync.Value.ToUniversalTime() > TimeSpan.FromHours(23)))
                {
                    // пишем в начале импорта, чтобы, если запустят в паралель еще
                    // то не прошло по условию времени последнего запуска
                    Configuration.SettingProvider.Items["SdekLastDateSyncPickPoints"] = currentDateTime.ToString("O");

                    if (!DeliveryPointService.Sync(_sdekApiService20))
                        // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                        Configuration.SettingProvider.Items["SdekLastDateSyncPickPoints"] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                        
                }
            }
            catch (Exception ex)
            {
                // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                Configuration.SettingProvider.Items["SdekLastDateSyncPickPoints"] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                Debug.Log.Warn(ex);
            }
        }
    }
}