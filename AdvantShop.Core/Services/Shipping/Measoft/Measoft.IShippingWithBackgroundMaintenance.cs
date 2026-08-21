using System;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Diagnostics;
using AdvantShop.Shipping.Measoft.Api;
using AdvantShop.Shipping.Measoft.DeliveryPoints;

namespace AdvantShop.Shipping.Measoft
{
    public partial class Measoft: IShippingWithBackgroundMaintenance
    {
        public void ExecuteJob()
        {
            if (_authOption.Login.IsNullOrEmpty()
                || _authOption.Password.IsNullOrEmpty())
                return;

            SyncPickPoints(_apiService, GetAccount());
        }

        public static void SyncPickPoints(MeasoftApiService apiService, string account)
        {
            account = account ?? throw new ArgumentNullException(nameof(account));
            
            // общая настройка, т.к. справочники общие, не зависят от настроек
            var settingsKeySync = $"MeasoftLastDateSyncPickPoints_{account}";
            var lastDateSync = Configuration.SettingProvider.Items[settingsKeySync].TryParseDateTime(true);
            try
            {
                var currentDateTime = DateTime.UtcNow;

                if (!lastDateSync.HasValue || (currentDateTime - lastDateSync.Value.ToUniversalTime() > TimeSpan.FromHours(23)))
                {
                    // пишем в начале импорта, чтобы, если запустят в паралель еще
                    // то не прошло по условию времени последнего запуска
                    Configuration.SettingProvider.Items[settingsKeySync] = currentDateTime.ToString("O");

                    if (!DeliveryPointService.Sync(apiService, account))
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