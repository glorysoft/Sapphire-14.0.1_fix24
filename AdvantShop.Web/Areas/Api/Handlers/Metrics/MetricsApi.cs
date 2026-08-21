using System;
using System.Web;
using AdvantShop.Areas.Api.Models.Metrics;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Diagnostics;
using AdvantShop.MobileApp;
using AdvantShop.Web.Infrastructure.Handlers;
using Newtonsoft.Json;

namespace AdvantShop.Areas.Api.Handlers.Metrics
{
    public sealed class MetricsApi : AbstractCommandHandler<MetricsApiResponse>
    {
        private readonly MetricsDto _model;

        public MetricsApi(MetricsDto model)
        {
            _model = model;
        }

        protected override void Validate()
        {
            if (_model == null)
                throw new BlException("Укажите обязательные поля");
            
            if (_model.AppVersion.IsNullOrEmpty() 
                || _model.Device == null
                || _model.Device?.DeviceId == null
                || _model.Locale == null
                || _model.Screen == null)
            {
                throw new BlException("Укажите обязательные поля");
            }
        }

        protected override MetricsApiResponse Handle()
        {
            try
            {
                var context = HttpContext.Current;
                
                var (ipBytes, ip) = context.TryGetIpBytes();
                if (ipBytes != null)
                {
                    var url = context.Request.RawUrl;
                    var userId = context.Request.Headers["X-API-USER-ID"]?.TryParseGuid(true);
                    var appId = context.Request.Headers["X-API-APP-ID"]?.TryParseGuid(true);
                    var metrics = JsonConvert.SerializeObject(_model);
                    var metricsHashCode = metrics.GetHashCode();

                    MobileAppRequestHistoryService.Log(
                        ipBytes,
                        ip,
                        url,
                        userId,
                        _model.AppVersion,
                        _model.Device?.DeviceId,
                        metrics,
                        metricsHashCode,
                        appId
                    );
                    
                    // если с такого же устройства, но других ip были запросы за последний час
                    var ips = MobileAppRequestHistoryService.GetOtherIpsByMetrics(ipBytes, metricsHashCode, _model.AppVersion);
                    if (ips.Count > 0)
                    {
                        // так мб если сменили wi-fi, моб интернет, proxy, но если таких запросов больше 4, то это сильно подозрительно
                        Debug.Log.Warn($"С текущего ip {ip} и других {string.Join(", ", ips)} были запросы с такого же устройства metricsHash: {metricsHashCode}, metrics: {metrics}");

                        // if (ips.Count > 3)
                        // {
                        //     var service = new PhoneConfirmationService();
                        //     var untilDate = DateTime.Now.AddMinutes(5);
                        //     
                        //     service.Ban(null, ip, untilDate);
                        //     
                        //     foreach (var otherIp in ips)
                        //         service.Ban(null, otherIp, untilDate);
                        // }
                    }

                    if (appId != null)
                    {
                        // если были запросы с таким же appId, но с других ip
                        var ipsByAppId = MobileAppRequestHistoryService.GetOtherIpsByAppId(ipBytes, appId.Value);
                        if (ipsByAppId.Count > 0)
                        {
                            Debug.Log.Warn($"С текущего ip {ip} и других {string.Join(", ", ipsByAppId)} были запросы с такого же устройства appId: {appId}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
            
            return new MetricsApiResponse();
        }
    }
}