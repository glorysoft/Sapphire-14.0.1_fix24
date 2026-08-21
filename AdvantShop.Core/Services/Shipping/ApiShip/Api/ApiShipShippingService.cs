using AdvantShop.Core.Caching;
using AdvantShop.Diagnostics;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using AdvantShop.Configuration;

namespace AdvantShop.Shipping.ApiShip.Api
{
    public class ApiShipShippingService
    {
        public ApiShipShippingService(string apiKey)
        {
            _isTest = apiKey == "test";
            _apiToken = _isTest ? GetToken("test", "test") : apiKey;

            _serializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
            };
        }

        private readonly string _apiToken;
        private readonly bool _isTest;
        private static readonly string UrlApi = LinkService.ShippingMethod.ApiShip.General + "/";
        private static readonly string UrlTestApi = LinkService.ShippingMethod.ApiShip.Test + "/";
        private readonly JsonSerializerSettings _serializerSettings;

        private Dictionary<string, string> GetHeaders()
        {
            return new Dictionary<string, string>
                {
                    { "Authorization", _apiToken },
                    { "Platform", "advantshop" }
                };
        }

        private class AddParam
        {
            public string Name { get; set; }
            public string Value { get; set; }
        }

        public ApiShipCalculatorResponseModel GetCalculator(ApiShipCalculatorRequestModel model)
        {
            var calculatorResult = PostApiResponse<ApiShipCalculatorResponseModel, ApiShipCalculatorRequestModel>(model, "calculator");
            return calculatorResult;
        }

        public ApiShipPointsModel GetApiShipPoints(int limit, int offset)
        {
            return GetApiResponse<ApiShipPointsModel>($"lists/points?limit={limit}"
                                                      + (offset > 0 ? $"&offset={offset}" : string.Empty));
        }

        public List<ApiShipTariff> GetApiShipTariffs()
        {
            return CacheManager.Get("ApiShip_List_Tariffs", 60 * 24, () =>
            {
                var apiShipTariff = new List<ApiShipTariff>();
                ApiShipTariffsResponseModel tariffResponse;
                int i = 0;
                int countItemOnOneRequest = 1000;
                do
                {
                    tariffResponse = GetApiResponse<ApiShipTariffsResponseModel>("lists/tariffs?filter=" + $@"&limit={countItemOnOneRequest}" + (i > 0 ? $@"&offset={i * countItemOnOneRequest}" : string.Empty));
                    i++;
                    
                    if (tariffResponse?.Rows?.Count > 0) 
                        apiShipTariff.AddRange(tariffResponse.Rows);
                }
                while (tariffResponse?.Rows?.Count > 0);
                
                return apiShipTariff;
            });
        }

        public List<ApiShipProvider> GetApiShipProviders()
        {
            var tariffModel = GetApiResponse<ApiShipPovidersModel>("lists/providers");
            return tariffModel?.Rows ?? new List<ApiShipProvider>();
        }

        public ApiShipAddOrderResponseModel ApiShipSendOrder(ApiShipAddOrderRequestModel order)
        {
            var result = PostApiResponse<ApiShipAddOrderResponseModel, ApiShipAddOrderRequestModel>(order, "orders");
            return result;
        }

        public string GetToken(string login, string password)
        {
            string token = "";
            var model = new ApiShipTokenRequestModel();
            model.Login = login;
            model.Password = password;
            try
            {
                string url = (_isTest ? UrlTestApi : UrlApi) + "users/login";
                var request = CreateRequestAsync(url, model, WebRequestMethods.Http.Post, "application/json", null).ConfigureAwait(false).GetAwaiter().GetResult();
                using (var response = request.GetResponseAsync().ConfigureAwait(false).GetAwaiter().GetResult())
                {
                    var result = DeserializeObjectAsync<ApiShipTokenResponseModel>(response.GetResponseStream())
                        .ConfigureAwait(false)
                        .GetAwaiter()
                        .GetResult();
                    token = result?.Token;
                }
            }
            catch (WebException ex)
            {
                using (var eResponse = (HttpWebResponse)ex.Response)
                {
                    if (eResponse != null)
                    {
                        LogRequestError<ApiShipErrorModel>(eResponse);
                    }
                }
            }
            catch (System.Exception ex)
            {
                Debug.Log.Error(ex);
            }
            return token;
        }

        public ApiShipOrderStatusModel GetApiShipOrderStatus(string orderId)
        {
            string orderNumber = orderId;
            var orderStatus = GetApiResponse<ApiShipOrderStatusModel>("orders/status?clientNumber=" + orderNumber);
            return orderStatus;
        }

        private T GetApiResponse<T>(string method) where T : class
        {
            try
            {
                string url = (_isTest ? UrlTestApi : UrlApi) + method;
                var request = CreateRequestAsync(url, null, WebRequestMethods.Http.Get, "application/json", "application/json", GetHeaders()).ConfigureAwait(false).GetAwaiter().GetResult();
                using (var response = request.GetResponse())
                {
                    return DeserializeObjectAsync<T>(response.GetResponseStream())
                        .ConfigureAwait(false)
                        .GetAwaiter()
                        .GetResult();
                }
            }
            catch (WebException ex)
            {
                using (var eResponse = (HttpWebResponse)ex.Response)
                {
                    if (eResponse != null)
                    {
                        LogRequestError<ApiShipErrorModel>(eResponse);
                    }
                }
            }
            catch (System.Exception ex)
            {
                Debug.Log.Error(ex);
            }
            return default(T);
        }

        private T PostApiResponse<T, M>(M model, string method) where T : ApiShipErrorModel
        {
            try
            {
                string url = (_isTest ? UrlTestApi : UrlApi) + method;

                var request = CreateRequestAsync(url, model, WebRequestMethods.Http.Post, "application/json", "application/json", GetHeaders()).ConfigureAwait(false).GetAwaiter().GetResult();
                using (var response = request.GetResponse())
                {
                    return DeserializeObjectAsync<T>(response.GetResponseStream())
                        .ConfigureAwait(false)
                        .GetAwaiter()
                        .GetResult();
                }
            }
            catch (WebException ex)
            {
                using (var eResponse = (HttpWebResponse)ex.Response)
                {
                    if (eResponse != null)
                    {
                        return LogRequestError<T>(eResponse);
                    }
                }
            }
            catch (System.Exception ex)
            {
                Debug.Log.Error(ex);
            }
            return default(T);
        }

        public ApiShipDeleteOrderModel ApiShipDeleteOrder(int apiShipOrderId, string method)
        {
            try
            {
                string url = (_isTest ? UrlTestApi : UrlApi) + method + "/" + apiShipOrderId;

                var request = CreateRequestAsync(url, null, "DELETE", "application/json", "application/json", GetHeaders()).ConfigureAwait(false).GetAwaiter().GetResult();
                using (var response = request.GetResponseAsync().ConfigureAwait(false).GetAwaiter().GetResult())
                {
                    return DeserializeObjectAsync<ApiShipDeleteOrderModel>(response.GetResponseStream())
                        .ConfigureAwait(false)
                        .GetAwaiter()
                        .GetResult();
                }
            }
            catch (WebException ex)
            {
                using (var eResponse = (HttpWebResponse)ex.Response)
                {
                    if (eResponse != null)
                    {
                        LogRequestError<ApiShipErrorModel>(eResponse);
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
            return default(ApiShipDeleteOrderModel);
        }

        private T LogRequestError<T>(HttpWebResponse response) where T : ApiShipErrorModel
        {
            string tracingId = response.Headers.Get("X-Tracing-Id");
            ApiShipErrorModel errorResult = new ApiShipErrorModel();
            errorResult = DeserializeObjectAsync<T>(response.GetResponseStream())
                .ConfigureAwait(false)
                .GetAwaiter()
                .GetResult();
            Debug.Log.Error(String.Format("Ошибка: {0}. Описание: {1}. Поле ошибки: {2}. Расшифровка ошибки: {3}. x-tracing-id: {4}",
                errorResult.Message, errorResult.Description, 
                (errorResult.Errors != null && errorResult.Errors.Count > 0 ? errorResult.Errors[0].Field : ""), 
                (errorResult.Errors != null && errorResult.Errors.Count > 0 ? errorResult.Errors[0].Message : ""), 
                tracingId));
            return (T)errorResult;
        }

        private async Task<HttpWebRequest> CreateRequestAsync(string url, object data, string method, string contentType, string accept, Dictionary<string,string> headers = null)
        {
            var request = WebRequest.Create(url) as HttpWebRequest;
            request.Method = method;
            request.ContentType = contentType;

            if (headers != null)
            {
                foreach (var item in headers)
                {
                    request.Headers.Add(item.Key, item.Value);
                }
            }
            if (!string.IsNullOrEmpty(accept))
            {
                request.Accept = accept;
            }

            if (data != null)
                using (var requestStream = await request.GetRequestStreamAsync().ConfigureAwait(false))
                    await SerializeObjectAsync(data, requestStream).ConfigureAwait(false);
            return request;
        }

        private Task SerializeObjectAsync(object data, Stream stream)
        {
#if DEBUG
            string dataPost = JsonConvert.SerializeObject(data, _serializerSettings);

            byte[] bytes = Encoding.UTF8.GetBytes(dataPost);
            //request.ContentLength = bytes.Length;

            return stream.WriteAsync(bytes, 0, bytes.Length);
#endif
#if !DEBUG
            using (StreamWriter writer = new StreamWriter(stream))
            using (JsonTextWriter jsonWriter = new JsonTextWriter(writer))
            {
                JsonSerializer serializer = JsonSerializer.Create(_serializerSettings);
                serializer.Serialize(jsonWriter, data);
                return jsonWriter.FlushAsync();
            }
#endif
        }

        private async Task<T> DeserializeObjectAsync<T>(Stream stream)
    where T : class
        {
            using (var reader = new StreamReader(stream))
            {
#if DEBUG
                var responseContent = "";
                responseContent = await reader.ReadToEndAsync().ConfigureAwait(false);
                return JsonConvert.DeserializeObject<T>(responseContent, _serializerSettings);
#endif
#if !DEBUG
                using (JsonReader jsonReader = new JsonTextReader(reader))
                {
                    JsonSerializer serializer = JsonSerializer.Create(_serializerSettings);

                    // read the json from a stream
                    // json size doesn't matter because only a small piece is read at a time from the HTTP request
                    return serializer.Deserialize<T>(jsonReader);
                }
#endif
            }
        }
    }
}
