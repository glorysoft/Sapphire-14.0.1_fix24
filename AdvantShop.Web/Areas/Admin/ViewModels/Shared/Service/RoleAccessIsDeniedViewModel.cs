using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;

namespace AdvantShop.Web.Admin.ViewModels.Shared.Service
{
    public class RoleAccessIsDeniedViewModel
    {
        public string Title { get; set; }
        public string Description { get; set; }

        public RoleAccessIsDeniedViewModel(RoleAction roleAction)
        {
            Title = LocalizationService.GetResource(roleAction.Localize());
            Description = roleAction != RoleAction.None
                ? LocalizationService.GetResource("Admin.Service.RoleAccesslsDenied.AccessIsClosed")
                : LocalizationService.GetResource("Admin.Service.RoleAccessIsDenied.AccessOnlyForAdmin");
        }

        public RoleAccessIsDeniedViewModel(string title)
        {
            Title = title;
            Description = LocalizationService.GetResource("Admin.Service.RoleAccesslsDenied.AccessIsClosed");
        }
    }
}