using System;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Shipping.ApiShip.DeliveryPoints;
using AdvantShop.Diagnostics;
using AdvantShop.Shipping.ApiShip.Api;

namespace AdvantShop.Shipping.ApiShip
{
    public partial class ApiShip: IShippingWithBackgroundMaintenance
    {
        public void ExecuteJob()
        {
            if (_apiKey.IsNullOrEmpty())
                return;

            SyncPickPoints(_apiShipService, _apiKey);
        }

        public static void SyncPickPoints(ApiShipShippingService apiShipService, string account)
        {
            account = account ?? throw new ArgumentNullException(nameof(account));
            
            // общая настройка, т.к. справочники общие, не зависят от настроек
            var settingsKeySync = $"ApiShipLastDateSyncPickPoints_{account.GetHashCode()}";
            var lastDateSync = Configuration.SettingProvider.Items[settingsKeySync].TryParseDateTime(true);
            try
            {
                var currentDateTime = DateTime.UtcNow;

                if (!lastDateSync.HasValue || (currentDateTime - lastDateSync.Value.ToUniversalTime() > TimeSpan.FromHours(23)))
                {
                    // пишем в начале импорта, чтобы, если запустят в паралель еще
                    // то не прошло по условию времени последнего запуска
                    Configuration.SettingProvider.Items[settingsKeySync] = currentDateTime.ToString("O");

                    if (!DeliveryPointService.Sync(apiShipService, account))
                        // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                        Configuration.SettingProvider.Items[settingsKeySync] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                        
                }
            }
            catch (Exception ex)
            {
                // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                Configuration.SettingProvider.Items[settingsKeySync] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                Debug.Log.Warn(ex);
            }
        }
    }
}