using System.Collections.Generic;
using AdvantShop.Core.Services.Api;

namespace AdvantShop.Areas.Api.Models.Users
{
    public class AuthModulesMethodsResponse : List<AuthModuleModel>, IApiResponse
    {
        public AuthModulesMethodsResponse(List<AuthModuleModel> authModules) =>
            this.AddRange(authModules);
    }
}