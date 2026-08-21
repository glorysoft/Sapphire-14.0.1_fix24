using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.CriticalCss.DTOs;
using AdvantShop.CriticalCss.Enums;
using Newtonsoft.Json;

namespace AdvantShop.CriticalCss
{
    public static partial class CriticalCssService
    {
                private static CreateCriticalCssResponseDto CreateCssRequest(
            CriticalCssDevice device,
            Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> bundles
        )
        {
            var url = $"{LinkService.Internal.Yahont}/api/v2/css";
            var data = new CreateCriticalCssRequestDto(
                SettingsMain.SiteUrl,
                new CriticalCssOptionsDto(device),
                bundles
            );
            var bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(data));

            var request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = WebRequestMethods.Http.Post;
            request.ContentType = ERequestContentType.TextJson.StrName();
            request.ContentLength = bytes.Length;
            request.Headers[DomainHeaderKey] = SettingsMain.SiteUrl;
            request.Headers[ApiAuthHeaderKey] = SettingsLic.LicKey;

            using (var requestStream = request.GetRequestStream())
            {
                requestStream.Write(bytes, 0, bytes.Length);
                requestStream.Close();
            }

            using (var response = request.GetResponse())
            using (var responseStream = response.GetResponseStream())
                if (responseStream != null)
                    using (var reader = new StreamReader(responseStream))
                    using (var jsonReader = new JsonTextReader(reader))
                        return JsonSerializer.Create().Deserialize<CreateCriticalCssResponseDto>(jsonReader);

            throw new Exception("Response is empty");
        }

        private static ResultCriticalCssResponseDto GetCssRequest(Guid taskId)
        {
            var url = $"{LinkService.Internal.Yahont}/api/v2/css/{taskId}";

            var request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = WebRequestMethods.Http.Get;
            request.Headers[DomainHeaderKey] = SettingsMain.SiteUrl;
            request.Headers[ApiAuthHeaderKey] = SettingsLic.LicKey;

            using (var response = request.GetResponse() as HttpWebResponse)
                switch (response?.StatusCode)
                {
                    case HttpStatusCode.OK:
                    {
                        using (var responseStream = response.GetResponseStream())
                            if (responseStream != null)
                                using (var reader = new StreamReader(responseStream))
                                using (var jsonReader = new JsonTextReader(reader))
                                    return JsonSerializer.Create()
                                        .Deserialize<ResultCriticalCssResponseDto>(jsonReader);
                        break;
                    }
                    case HttpStatusCode.NoContent:
                        return null;
                }

            throw new Exception("Unexpected result of obtaining css");
        }
    }
}