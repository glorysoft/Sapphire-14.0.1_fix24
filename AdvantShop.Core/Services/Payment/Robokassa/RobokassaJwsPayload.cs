using System;
using System.Net;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using AdvantShop.Core.Caching;
using AdvantShop.Diagnostics;
using Newtonsoft.Json;

namespace AdvantShop.Core.Services.Payment.Robokassa
{
    internal sealed class RobokassaResult2Dto
    {
        public RobokassaJwsPayload Data { get; set; }
    }

    internal sealed class RobokassaJwsPayload
    {
        public string Shop { get; set; }
        public string OpKey { get; set; }
        public string InvId { get; set; }
        public string PaymentMethod { get; set; }
        public string IncSum { get; set; }
        public string State { get; set; }
    }

    internal static class RobokassaJwsPayloadHelper
    {
        public static (RobokassaJwsPayload payload, bool validSignature) FromJwsString(string jwsString)
        {
            try
            {
                var parts = jwsString.Split('.');
                if (parts.Length != 3) throw new ArgumentException("JWS must have 3 parts: header.payload.signature");

                var encodedHeader = parts[0];
                var encodedPayload = parts[1];
                var encodedSignature = parts[2];

                if(!ValidateSignature(encodedHeader, encodedPayload, encodedSignature))
                    return (null, false);

                var jwsPayloadDecodedBytes = Base64UrlDecode(encodedPayload);
                var jwsPayloadDecodedString = Encoding.UTF8.GetString(jwsPayloadDecodedBytes);
                
                var payload = JsonConvert.DeserializeObject<RobokassaResult2Dto>(jwsPayloadDecodedString);
                
                return (payload.Data, true);
            }
            catch (Exception exception)
            {
                Debug.Log.Error("Failed to parse JWS string", exception);
                return (null, false);
            }
        }

        private static byte[] Base64UrlDecode(string input)
        {
            try
            {
                // часть примеров проходит как обычная base64 - поэтому пробуем сначала так конвертнуть
                return Convert.FromBase64String(input);
            }
            catch (Exception)
            {
                var output = input
                    .Replace('-', '+')
                    .Replace('_', '/');

                switch (output.Length % 4)
                {
                    case 2: output += "=="; break;
                    case 3: output += "="; break;
                }

                return Convert.FromBase64String(output);
            }
        }
        
        private static bool ValidateSignature(string encodedHeader,
            string encodedPayload, string encodedSignature)
        {
            var pemCertificate = LoadPemCertificate();

            var signingInputString = encodedHeader + "." + encodedPayload;
            var signingInput = Encoding.UTF8.GetBytes(signingInputString);

            var signature = Base64UrlDecode(encodedSignature);

            var rsa = pemCertificate.GetRSAPublicKey();
            var hashAlg = HashAlgorithmName.SHA256;
            var padding = RSASignaturePadding.Pkcs1;
              
            var valid = rsa.VerifyData(signingInput, signature, hashAlg, padding);
            return valid;
        }

        private static X509Certificate2 LoadPemCertificate()
        {
            const string key = nameof(RobokassaJwsPayloadHelper) + "_" + nameof(LoadPemCertificate);
            if (CacheManager.TryGetValue(key,
                    out X509Certificate2 certificate)) return certificate;
            
            var certString = new WebClient().DownloadString("https://docs.robokassa.ru/media/files/jwtsign.cer");

            var base64 = certString
                .Replace("-----BEGIN CERTIFICATE-----", "")
                .Replace("-----END CERTIFICATE-----", "")
                .Replace("\r", "")
                .Replace("\n", "")
                .Trim();
            var bytes = Convert.FromBase64String(base64);

            var newCertificate = new X509Certificate2(bytes);
            CacheManager.Insert(key, newCertificate, minutes: 60);
            return newCertificate;

        }
    }
}