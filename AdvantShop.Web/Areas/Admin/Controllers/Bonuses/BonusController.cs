using System.Web.Mvc;
using AdvantShop.Web.Infrastructure.Controllers;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.SalesChannels;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Attributes;

namespace AdvantShop.Web.Admin.Controllers.Bonuses
{
    [Auth(RoleAction.BonusSystem)]
    [SaasFeature(Saas.ESaasProperty.BonusSystem)]
    [SalesChannel(ESalesChannelType.Bonus)]
    [BonusSystem("")]
    public class BonusController : BaseAdminController
    {
        
        public ActionResult Index()
        {
            var isMobile = SettingsDesign.IsMobileTemplate;

            if(isMobile)
            {
                SetNgController(NgControllers.NgControllersTypes.ExportFeedsCtrl);
                return View();
            } 
            else
            {
                return Redirect(UrlService.GetAdminUrl("cards"));
            }
        }
    }
}
