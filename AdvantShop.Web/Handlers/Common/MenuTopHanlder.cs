using System.Collections.Generic;
using AdvantShop.CMS;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Customers;
using AdvantShop.Handlers.Menu;

namespace AdvantShop.Handlers.Common
{
    public class MenuTopHanlder
    {
        public List<MenuItemModel> GetTopMenuItems()
        {
            var isRegistered = CustomerContext.CurrentCustomer.RegistredUser;
            var cacheName = !isRegistered
                ? CacheNames.GetMainMenuCacheObjectName() + "TopMenu"
                : CacheNames.GetMainMenuAuthCacheObjectName() + "TopMenu";

            var menuType = isRegistered
                ? EMenuItemShowMode.Authorized
                : EMenuItemShowMode.NotAuthorized;

            var menuItems = CacheManager.Get(cacheName, () => MenuService.GetMenuItems(0, EMenuType.Top, menuType))
                .DeepCloneJson(); // don't modify object in cache
            
            MenuHandler.CheckSelectedMenuItems(menuItems);
            return menuItems;
        }
    }
}