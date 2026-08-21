using System;
using System.IO;
using System.Net;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Diagnostics;
using Newtonsoft.Json;

namespace AdvantShop.Core.Services.DownloadableContent
{
    public class ShopNewsService
    {
        private static readonly string ShopNewsUrl = $"{LinkService.Internal.ApiServiceNotSecure}/news/last";

        public static AdminShopNews GetLastNews()
        {
            return CacheManager.Get("AdvantshopAdminNews", 15, () =>
            {
                var modules = new AdminShopNews();

                try
                {
                    var request = WebRequest.Create(ShopNewsUrl);
                    request.Method = "GET";
                    request.Timeout = 500;

                    using (var dataStream = request.GetResponse().GetResponseStream())
                    {
                        using (var reader = new StreamReader(dataStream))
                        {
                            var responseFromServer = reader.ReadToEnd();
                            if (!string.IsNullOrEmpty(responseFromServer))
                            {
                                modules = JsonConvert.DeserializeObject<AdminShopNews>(responseFromServer);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Debug.Log.Warn(ex);
                }

                return modules;
            });
        }
    }
}
