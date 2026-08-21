using System.Collections.Generic;
using AdvantShop.Core.Services.Auth.Modules;

namespace AdvantShop.Areas.Api.Models.Users
{
    public class AuthModuleModel
    {
        public string Module { get; set; }
        public string Title { get; set; }
        public bool IsDefault { get; set; }
        public List<AuthModuleApiMethod> Methods { get; set; }
    }
}