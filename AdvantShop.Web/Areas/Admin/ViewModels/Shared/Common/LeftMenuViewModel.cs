using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.SalesChannels;
using AdvantShop.Web.Admin.Models.Cms.Menus;
using CmsMenuItemModel = AdvantShop.Core.Services.CMS.MenuItemModel;

namespace AdvantShop.Web.Admin.ViewModels.Shared.Common
{
    public class LeftMenuViewModel
    {
        public LeftMenuViewModel()
        {
            MenuItems = new List<AdminGroupMenuModel>();
            DisplayCatalog = true;
            DisplayCustomers = true;
            DisplayOrders = true;
            DisplayCrm = true;
            CustomMenuItems = new List<CmsMenuItemModel>();
            NumberLimitationMenuItem = 0;
        }

        public List<AdminGroupMenuModel> MenuItems { get; set; }
        public List<CmsMenuItemModel> CustomMenuItems { get; set; }

        public Guid CustomerId { get; set; }
        public string AvatarSrc { get; set; }
        public string NoAvatarSrc { get; set; }

        public bool DisplayCatalog { get; set; }
        public bool DisplayCustomers { get; set; }
        public bool DisplayOrders { get; set; }
        public bool DisplayCrm { get; set; }
        public bool DisplayCms { get; set; }
        public bool DisplaySettings { get; set; }

        public bool ShowAddMenu
        {
            get
            {
                return DisplayCatalog || DisplayCustomers || DisplayOrders || DisplayCrm || DisplayCms || DisplaySettings;
            }
        }

        public List<SalesChannel> SalesChannelsMenuItems { get; set; }
        public bool IsDashBoard { get; set; }
        public bool IsMobile { get; set; }
        public int NumberLimitationMenuItem { get; set; }
    }
}
