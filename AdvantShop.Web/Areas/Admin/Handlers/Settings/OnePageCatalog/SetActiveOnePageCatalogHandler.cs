using System;
using System.Text;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Files;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Design;
using AdvantShop.Helpers;
using AdvantShop.Web.Admin.Models.Settings;
using AdvantShop.Web.Admin.ViewModels.Settings;

namespace AdvantShop.Web.Admin.Handlers.Settings
{
    public class SetActiveOnePageCatalogHandler
    {
        public SetActiveOnePageCatalogHandler()
        {
        }
        
        public void Set(bool isActive)
        {
            SettingsDesign.OnePageCatalog = isActive;
        }
    }
}