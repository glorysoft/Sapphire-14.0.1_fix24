using System;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Shipping.Boxberry;
using AdvantShop.Core.Services.Shipping.Boxberry.DeliveryPoints;
using AdvantShop.Diagnostics;

namespace AdvantShop.Shipping.Boxberry
{
    public partial class Boxberry: IShippingWithBackgroundMaintenance
    {
        public void ExecuteJob()
        {
            if (_apiUrl.IsNullOrEmpty()
                || !_token.IsNullOrEmpty())
                return;

            SyncPickPoints(_boxberryApiService);
        }

        public static void SyncPickPoints(BoxberryApiService apiService)
        {
            // общая настройка, т.к. справочники общие, не зависят от настроек
            var lastDateSync = Configuration.SettingProvider.Items["BoxberryLastDateSyncPickPoints"].TryParseDateTime(true);
            try
            {
                var currentDateTime = DateTime.UtcNow;

                if (!lastDateSync.HasValue || (currentDateTime - lastDateSync.Value.ToUniversalTime() > TimeSpan.FromHours(23)))
                {
                    // пишем в начале импорта, чтобы, если запустят в паралель еще
                    // то не прошло по условию времени последнего запуска
                    Configuration.SettingProvider.Items["BoxberryLastDateSyncPickPoints"] = currentDateTime.ToString("O");

                    if (!DeliveryPointService.Sync(apiService))
                        // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                        Configuration.SettingProvider.Items["BoxberryLastDateSyncPickPoints"] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                        
                }
            }
            catch (Exception ex)
            {
                // возвращаем предыдущее заначение, чтобы при следующем запуске снова сработало
                Configuration.SettingProvider.Items["BoxberryLastDateSyncPickPoints"] = lastDateSync.HasValue ? lastDateSync.Value.ToString("O") : null;
                Debug.Log.Warn(ex);
            }
        }
    }
}