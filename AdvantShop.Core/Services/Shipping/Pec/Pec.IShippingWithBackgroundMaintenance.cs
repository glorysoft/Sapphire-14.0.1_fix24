using System;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Diagnostics;
using AdvantShop.Shipping.Pec.Api;
using AdvantShop.Shipping.Pec.Warehouses;

namespace AdvantShop.Shipping.Pec
{
    public partial class Pec: IShippingWithBackgroundMaintenance
    {
        public void ExecuteJob()
        {
            if (_login.IsNullOrEmpty()
                || _apiKey.IsNullOrEmpty())
                return;

            SyncPickPoints(_pecApi);
        }

        public static void SyncPickPoints(PecApiService pecApi)
        {
            // общая настройка, т.к. справочники общие, не зависят от настроек
            var lastDateSync = Configuration.SettingProvider.Items["PecLastDateSyncPickPoints"].TryParseDateTime(true);
            try
            {
                var currentDateTime = DateTime.UtcNow;

                if (!lastDateSync.HasValue || (currentDateTime - lastDateSync.Value.ToUniversalTime() > TimeSpan.FromHours(23)))
                {
                    // пишем в начале импорта, чтобы, если запустят в паралель еще
                    // то не прошло по условию времени последнего запуска
                    Configuration.SettingProvider.Items["PecLastDateSyncPickPoints"] = currentDateTime.ToString("O");

                    if (!WarehouseService.Sync(pecApi))
                        // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                        Configuration.SettingProvider.Items["PecLastDateSyncPickPoints"] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                        
                }
            }
            catch (Exception ex)
            {
                // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                Configuration.SettingProvider.Items["PecLastDateSyncPickPoints"] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                Debug.Log.Warn(ex);
            }
        }
    }
}