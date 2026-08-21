using System;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Diagnostics;
using AdvantShop.Shipping.Yandex.Api;
using AdvantShop.Shipping.Yandex.PickupPoints;

namespace AdvantShop.Shipping.Yandex
{
    public partial class YandexDelivery: IShippingWithBackgroundMaintenance
    {
        public void ExecuteJob()
        {
            if (_apiToken.IsNullOrEmpty())
                return;

            SyncPickPoints(_yandexDeliveryApi);
        }

        public static void SyncPickPoints(YandexDeliveryApiService yandexDeliveryApi)
        {
            // общая настройка, т.к. справочники общие, не зависят от настроек
            var lastDateSync = Configuration.SettingProvider.Items["YandexLastDateSyncPickPoints"].TryParseDateTime(true);
            try
            {
                var currentDateTime = DateTime.UtcNow;

                if (!lastDateSync.HasValue || (currentDateTime - lastDateSync.Value.ToUniversalTime() > TimeSpan.FromHours(23)))
                {
                    // пишем в начале импорта, чтобы, если запустят в паралель еще
                    // то не прошло по условию времени последнего запуска
                    Configuration.SettingProvider.Items["YandexLastDateSyncPickPoints"] = currentDateTime.ToString("O");

                    if (!PickupPointService.Sync(yandexDeliveryApi))
                        // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                        Configuration.SettingProvider.Items["YandexLastDateSyncPickPoints"] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                        
                }
            }
            catch (Exception ex)
            {
                // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                Configuration.SettingProvider.Items["YandexLastDateSyncPickPoints"] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                Debug.Log.Warn(ex);
            }
        }
    }
}