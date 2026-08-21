using System.Linq;
using System.Web.Mvc;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Core.Services.Repository;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Repository;
using AdvantShop.Saas;

namespace AdvantShop.Web.Infrastructure.Filters
{
    public class CountryAccessAttribute : ActionFilterAttribute
    {
        private const string ExceptionTemplate = "Access denied from the country of the ip {0}";
        
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (AppServiceStartAction.state != PingDbState.NoError || filterContext.IsChildAction)
                return;

            var ip = filterContext.RequestContext.HttpContext.TryGetIp();

            if (!CustomerContext.CurrentCustomer.RegistredUser && !HasSiteAccess(ip))
            {
                filterContext.Result = new HttpStatusCodeResult(403, string.Format(ExceptionTemplate, ip));
            }
        }
        
        private static bool HasSiteAccess(string ip)
        {
            if (BrowsersHelper.IsBot() && SettingsGeneral.AllowSearchBotsFromOtherCountries)
                return true;
            
            var saasData = SaasDataService.CurrentSaasData;
            if (saasData.IpWhiteListValues?.Any(x => UrlService.IsInSubnet(ip, x)) is true) 
                return true;

            var allowedSiteBrowsingCountries = AdditionalOptionsService.Get(
                    EnAdditionalOptionObjectType.Country,
                    CountryAdditionalOptionNames.AllowSiteBrowsing
                )
                .Where(option => option.ObjId != 0 && option.Value.TryParseBool())
                .Select(option => option.ObjId)
                .ToList();
            
            if (allowedSiteBrowsingCountries.Count == 0) 
                return true;
            
            var countryId = GetCountryId(ip);
            if (!countryId.HasValue || countryId == 0) 
                return true;
            
            return allowedSiteBrowsingCountries.Contains(countryId.Value);
        }

        private static int? GetCountryId(string ip)
        {
            if (ip.IsLocalIP())
                return null;

            var countryId = GetCountryIdByModule(ip);
            if (countryId.HasValue)
                return countryId.Value;

            var geoIpData = GeoIpService.GetGeoIpData(ip);
            if (geoIpData != null && geoIpData.Country.IsNotEmpty())
            {
                var country = CountryService.GetCountryByIso2(geoIpData.Country);
                return country?.CountryId;
            }
            
            return null;
        }

        private static int? GetCountryIdByModule(string ip)
        {
            var modules = AttachedModules.GetModuleInstances<IGeoIp>();
            if (modules == null || modules.Count == 0)
                return null;
            
            foreach (var module in modules)
            {
                var moduleZone = module.GetIpZone(ip);
                if (moduleZone != null && moduleZone.CountryId != 0)
                    return moduleZone.CountryId;
            }
            
            return null;
        }
    }
}