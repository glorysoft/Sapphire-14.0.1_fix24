using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.MobileApp;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AdvantShop.Core.Services.Loging.Push
{
    public class PushLog
    {
        public Guid CustomerId { get; set; }
        public Guid MessageId { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public string ModuleName { get; set; }
        public Dictionary<string, string> Parameters { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public PushStatus Status { get; set; }

        public DateTime CreateOn { get; set; }
        
        public NotificationSource Source { get; set; }

        public int Id
        {
            get
            {
                unchecked
                {
                    int hash = (int)2166136261;
                    hash = (hash * 16777619) ^ CustomerId.GetHashCode();
                    hash = (hash * 16777619) ^ MessageId.GetHashCode();
                    hash = (hash * 16777619) ^ (!string.IsNullOrEmpty(Title) ? Title.GetHashCode() : 0);
                    hash = (hash * 16777619) ^ (!string.IsNullOrEmpty(Body) ? Body.GetHashCode() : 0);
                    hash = (hash * 16777619) ^ (!string.IsNullOrEmpty(ModuleName) ? ModuleName.GetHashCode() : 0);
                    hash = (hash * 16777619) ^ (Parameters != null
                        ? string.Join("", Parameters.Select(pair => pair.Key + pair.Value)).GetHashCode()
                        : 0);
                    hash = (hash * 16777619) ^ Status.GetHashCode();
                    hash = (hash * 16777619) ^ CreateOn.GetHashCode();

                    return hash;
                }
            }
        }
    }
}