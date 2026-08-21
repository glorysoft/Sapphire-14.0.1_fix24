using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using AdvantShop.Configuration;
using AdvantShop.Diagnostics;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace AdvantShop.Core.Services.Payment.Thawani.Api
{
    public class ThawaniApiService
    {
        // Doc: https://docs.thawani.om/
        // Doc: https://thawani-technologies.stoplight.io/docs/thawani-ecommerce-api/ZG9jOjkxNjU0OQ-error-success-codes
        
        private static readonly string SandboxBaseUrl = LinkService.PaymentMethod.Thawani.SandboxApi;
        private static readonly string BaseUrl = LinkService.PaymentMethod.Thawani.BaseApi;

        private readonly string _apiKey;
        private readonly bool _sandbox;

        public ThawaniApiService(string apiKey, bool sandbox)
        {
            _apiKey = apiKey;
            _sandbox = sandbox;

            Initialize();
        }

        /// <summary>
        /// Gets or sets json serialization settings.
        /// </summary>
        public JsonSerializerSettings SerializationSettings { get; private set; }

        /// <summary>
        /// Gets or sets json deserialization settings.
        /// </summary>
        public JsonSerializerSettings DeserializationSettings { get; private set; }

        public BaseResponse<CheckoutModel> CreateSession(CreateSession session)
            => MakeRequest<BaseResponse<CheckoutModel>>("/checkout/session", session);

        public async Task<T> DeserializeObject<T>(string payload)
            where T : class
        {
            using (var ms = new MemoryStream())
            using (var writer = new StreamWriter(ms))
            {
                await writer.WriteAsync(payload ?? string.Empty).ConfigureAwait(false);
                await writer.FlushAsync().ConfigureAwait(false);
                ms.Seek(0, SeekOrigin.Begin);
                return await DeserializeObjectAsync<T>(ms);
            }
        }

        #region Private methods

        private void Initialize()
        {
            SerializationSettings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
#if DEBUG
                Formatting = Formatting.Indented,
#endif
#if !DEBUG
                Formatting = Formatting.None,
#endif
                ContractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new SnakeCaseNamingStrategy()
                }
            };
            DeserializationSettings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                ContractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new SnakeCaseNamingStrategy()
                }
            };
        }

        private T MakeRequest<T>(string url, object data = null, string method = WebRequestMethods.Http.Post)
            where T : BaseResponse
        {
            return Task.Run<T>((Func<Task<T>>)(async () => await MakeRequestAsync<T>(url, data, method).ConfigureAwait(false))).Result;
        }

        private async Task<T> MakeRequestAsync<T>(string url, object data = null, string method = WebRequestMethods.Http.Post)
            where T : BaseResponse
        {
            try
            {
                var request = await CreateRequestAsync(url, data, method).ConfigureAwait(false);
                
                using (var response = await request.GetResponseAsync().ConfigureAwait(false))
                using (var stream = response.GetResponseStream())
                    if (stream != null)
                        return await DeserializeObjectAsync<T>(stream).ConfigureAwait(false);

            }
            catch (WebException ex)
            {
                using (var eResponse = (HttpWebResponse)ex.Response)
                {
                    if (eResponse != null)
                    {
                        using (var eStream = eResponse.GetResponseStream())
                            if (eStream != null)
                            {
                                try
                                {
                                    HttpStatusCode statusCode = eResponse.StatusCode;

                                    if (statusCode == HttpStatusCode.BadRequest)
                                    {
                                        BaseResponse error = DeserializeObjectAsync<T>(eStream).ConfigureAwait(false)
                                           .GetAwaiter().GetResult();
                                        Debug.Log.Warn(
                                            $"ThawaniApi Url: {eResponse.ResponseUri}, Error: {error?.Description}, Code: {error?.Code}, Data: {JsonConvert.SerializeObject(data, SerializationSettings)}",
                                            ex);
                                        return (T)error;
                                    }
                                    else
                                    {
                                        using (var reader = new StreamReader(eStream))
                                        {
                                            var error = $"ThawaniApi Url: {eResponse.ResponseUri}, Error: {reader.ReadToEnd()}";
                                            if (data != null)
                                            {
                                                error += " Data:" + JsonConvert.SerializeObject(data, SerializationSettings);
                                            }

                                            if (string.IsNullOrEmpty(error))
                                                Debug.Log.Warn(ex);
                                            else
                                            {
                                                Debug.Log.Warn(error, ex);
                                            }
                                        }
                                    } 
                                }
                                catch (Exception)
                                {
                                    Debug.Log.Warn(ex);
                                }
                            }
                            else
                                Debug.Log.Warn(ex);
                    }
                    else
                        Debug.Log.Warn(ex);
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                return (T) new BaseResponse()
                {
                    Success = false,
                    Description = ex.Message,
                };
            }

            return null;
        }

        private async Task<HttpWebRequest> CreateRequestAsync(string url, object data, string method)
        {
            var request = WebRequest.CreateHttp((_sandbox ? SandboxBaseUrl : BaseUrl) + url);
            request.Method = method;
            request.ContentType = "application/json";
            request.Accept = "application/json";
            request.Headers.Add("thawani-api-key", _apiKey);
            request.Timeout = 5000;

            if (data != null)
            {
                using (var requestStream = await request.GetRequestStreamAsync().ConfigureAwait(false))
                {
                    await SerializeObjectAsync(data, requestStream).ConfigureAwait(false);
                }
            }
            return request;
        }

        private Task SerializeObjectAsync(object data, Stream stream)
        {
#if DEBUG
            string dataPost = JsonConvert.SerializeObject(data, SerializationSettings);

            byte[] bytes = Encoding.UTF8.GetBytes(dataPost);
            //request.ContentLength = bytes.Length;

            return stream.WriteAsync(bytes, 0, bytes.Length);
#endif
#if !DEBUG
            using (StreamWriter writer = new StreamWriter(stream))
            using (JsonTextWriter jsonWriter = new JsonTextWriter(writer))
            {
                JsonSerializer serializer = JsonSerializer.Create(SerializationSettings);
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
                return JsonConvert.DeserializeObject<T>(responseContent, DeserializationSettings);
#endif
#if !DEBUG
                using (JsonReader jsonReader = new JsonTextReader(reader))
                {
                    JsonSerializer serializer = JsonSerializer.Create(DeserializationSettings);

                    // read the json from a stream
                    // json size doesn't matter because only a small piece is read at a time from the HTTP request
                    return serializer.Deserialize<T>(jsonReader);
                }
#endif
            }
        }

        #endregion
    }
}