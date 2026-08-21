using System.Collections.Generic;

namespace AdvantShop.Core.Services.Auth.Modules
{
    public class AuthModuleApiMethod
    {
        public string Name { get; set; }
        public string Method { get; set; }
        public int ApiVersion { get; set; }
        public string Url { get; set; }
        public object Parameters { get; set; }
        public object Response { get; set; }
        public List<string> Errors { get; set; }
    }
}