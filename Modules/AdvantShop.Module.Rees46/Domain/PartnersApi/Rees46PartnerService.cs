using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Diagnostics;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace AdvantShop.Module.Rees46.Domain.PartnersApi
{
    // docs: https://app.rees46.ru/api-doc/1.0.html
    public class Rees46PartnerService
    {
        private static readonly string Rees46Url = Rees46Settings.Url;
        
        public static Rees46ApiKeys RegisterCustomer(Rees46Customer customer)
        {
            return MakeRequest<Rees46ApiKeys>("/api/customers", customer);
        }

        public static Rees46ShopKeys CreateShop(Rees46Shop shop)
        {
            return MakeRequest<Rees46ShopKeys>("/api/shops", shop);
        }

        public static List<Rees46Category> GetCategories()
        {
            return MakeRequest<List<Rees46Category>>("/api/categories", method: "GET");
        }

        public static List<Rees46Currency> GetCurrencies()
        {
            return MakeRequest<List<Rees46Currency>>("/api/currencies", method: "GET");
        }

        private static T MakeRequest<T>(string url, object data = null, string method = "POST", string contentType = "application/json")
        {
            try
            {
                var requestUrl = string.Format(Rees46Url + url, method == "GET" ? "?" + data : string.Empty);

                var request = WebRequest.Create(requestUrl) as HttpWebRequest;
                request.Method = method;
                request.Timeout = 600000;
                request.ContentType = contentType;

                if (data != null && method == "POST")
                {
                    var dataStr = JsonConvert.SerializeObject(data,
                        new JsonSerializerSettings() {ContractResolver = new CamelCasePropertyNamesContractResolver()});

                    byte[] bytes = Encoding.UTF8.GetBytes(dataStr);
                    request.ContentLength = bytes.Length;

                    using (var requestStream = request.GetRequestStream())
                    {
                        requestStream.Write(bytes, 0, bytes.Length);
                        requestStream.Close();
                    }
                }

                var responseContent = "";
                using (var response = request.GetResponse())
                {
                    using (var stream = response.GetResponseStream())
                    {
                        if (stream != null)
                            using (var reader = new StreamReader(stream))
                            {
                                responseContent = reader.ReadToEnd();
                            }
                    }
                }

                return JsonConvert.DeserializeObject<T>(responseContent);
            }
            catch (WebException ex)
            {
                if (ex.Response == null)
                {
                    Debug.Log.Error(ex);
                    return default(T);
                }

                using (var stream = ex.Response.GetResponseStream())
                {
                    if (stream != null)
                        using (var reader = new StreamReader(stream))
                        {
                            var temp = reader.ReadToEnd();
                            if (temp.IsNotEmpty() && temp.Length < 150)
                            {
                                //result = JsonConvert.DeserializeObject<ResponsesApi>(temp);
                                //result.message =
                                //    result.message.Replace("#<ActiveRecord::RecordInvalid:", string.Empty)
                                //        .Replace(">", string.Empty);
                            }
                            return default(T);
                        }
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
            return default(T);
        }
    }
}
