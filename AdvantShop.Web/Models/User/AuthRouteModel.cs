using AdvantShop.Core.Services.Auth;

namespace AdvantShop.Models.User
{
    public sealed class AuthRouteModel
    {
        public EAuthMethod Type { get; set; }
        public string Method { get; set; }
        public string Title { get; set; }
        public string ModuleId { get; set; }
        public string ModuleControllerName { get; set; }
    }
}