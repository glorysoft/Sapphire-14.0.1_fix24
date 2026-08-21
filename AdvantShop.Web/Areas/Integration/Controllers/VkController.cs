using System.Web.Mvc;
using AdvantShop.Areas.Integration.Handlers.Vk;
using AdvantShop.Core.Services.SalesChannels;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Attributes;

namespace AdvantShop.Areas.Integration.Controllers
{
    public class VkController : Controller
    {
        [Auth(RoleAction.Vk), 
         SalesChannel(ESalesChannelType.Vk)]
        public ActionResult Auth(string clientId, string redirectUrl)
        {
            var url = new GetVkAuthUrl(clientId, redirectUrl).Execute();
            if (url == null)
                return Content("Access token already exists");
            
            return View(url);
        }
        
        [Auth(RoleAction.Vk),
         SalesChannel(ESalesChannelType.Vk)]
        public ActionResult AuthGroup(string clientId, string redirectUrl, string groupId)
        {
            var url = new GetVkAuthGroupUrl(clientId, redirectUrl, groupId).Execute();
            if (url == null)
                return Content("Access token for group already exists");
            
            return View("Auth", url);
        }
    }
}