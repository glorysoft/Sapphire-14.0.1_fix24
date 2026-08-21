using AdvantShop.Core.Services.Api;

namespace AdvantShop.Areas.Api.Models
{
    public sealed class SignInByEmailResponse : IApiResponse
    {
        public bool IsCodeSended { get; set; }
    }
}