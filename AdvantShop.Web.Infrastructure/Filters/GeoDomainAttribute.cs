using System.Web.Mvc;
using AdvantShop.Core.Services.Domains;
using AdvantShop.Repository;
using AdvantShop.Saas;

namespace AdvantShop.Web.Infrastructure.Filters
{
    public class GeoDomainAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;

            var warehousesActive = !SaasDataService.IsSaasEnabled || SaasDataService.CurrentSaasData.HasWarehouses;
            if (!warehousesActive)
                return;

            var geoDomain = DomainGeoLocationService.GetCurrentGeoLocation();
            if (geoDomain == null) 
                return;

            if (!IpZoneContext.IsCookieExists())
            {
                var city = DomainGeoLocationService.GetCity(geoDomain.Id);
                if (city != null)
                    IpZoneContext.SetZone(IpZone.Create(city));
            }
        }
    }
}