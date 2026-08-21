using System;
using AdvantShop.Areas.Integration.Models.Vk;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Crm.Vk;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Integration.Handlers.Vk
{
    internal sealed class GetVkAuthGroupUrl : ICommandHandler<VkAuthUrl>
    {
        private readonly string _clientId;
        private readonly string _redirectUrl;
        private readonly string _groupId;

        public GetVkAuthGroupUrl(string clientId, string redirectUrl, string groupId)
        {
            _clientId = clientId;
            _redirectUrl = redirectUrl;
            _groupId = groupId;
        }

        public VkAuthUrl Execute()
        {
            if (VkApiService.IsVkActive())
                return null;

            var url =
                string.Format(
                    "{0}/authorize?response_type=token&client_id={1}&redirect_uri={2}&group_ids={3}&scope={4}&display={5}",
                    LinkService.OAuth.Vk,
                    _clientId,
                    _redirectUrl,
                    _groupId,
                    "messages,manage",
                    "page");

            return new VkAuthUrl() { Url = url };
        }
    }
}