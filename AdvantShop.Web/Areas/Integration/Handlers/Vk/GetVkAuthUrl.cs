using System;
using AdvantShop.Areas.Integration.Models.Vk;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Integration.Handlers.Vk
{
    internal sealed class GetVkAuthUrl : ICommandHandler<VkAuthUrl>
    {
        private readonly string _clientId;
        private readonly string _redirectUrl;

        public GetVkAuthUrl(string clientId, string redirectUrl)
        {
            _clientId = clientId;
            _redirectUrl = redirectUrl;
        }

        public VkAuthUrl Execute()
        {
            var isConfigured = SettingsVk.UserTokenData != null
                               && SettingsVk.UserTokenData.access_token.IsNotEmpty();
            if (isConfigured)
                return null;

            SettingsVk.UserTokenCodeVerifier = Guid.NewGuid().ToString();

            var codeChallenge = SettingsVk.UserTokenCodeVerifier.Sha256AndToBase64UrlEncode();

            var state = SettingsVk.UserTokenState = Guid.NewGuid().ToString();

            var url =
                string.Format(
                    "{0}/authorize?response_type=code&client_id={1}&redirect_uri={2}&scope={3}&state={4}&code_challenge={5}&code_challenge_method=S256",
                    LinkService.OAuth.VkId,
                    _clientId,
                    _redirectUrl,
                    "wall groups market photos",
                    state,
                    codeChallenge);

            return new VkAuthUrl() { Url = url };
        }
    }
}