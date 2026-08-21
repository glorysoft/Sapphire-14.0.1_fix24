using System.Collections.Generic;
using System.Linq;
using System.Web;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Domains;
using AdvantShop.Helpers;
using AdvantShop.Repository;

namespace AdvantShop.Core.Services.Catalog.Warehouses
{
    public class WarehouseContext
    {
        public static List<int> CurrentWarehouseIds
        {
            get
            {
                if (HttpContext.Current == null)
                    return null;

                var ids = HttpContext.Current.Items["CurrentWarehouseIds"] != null
                    ? HttpContext.Current.Items["CurrentWarehouseIds"] as List<int>
                    : null;
                
                return ids;
            }
            set
            {
                if (HttpContext.Current == null)
                    return;

                HttpContext.Current.Items["CurrentWarehouseIds"] = value != null && value.Count > 0 ? value : null;
            }
        }
        
        public static List<int> GetAvailableWarehouseIds() 
            => SettingsCatalog.ShowOnlyAvalible ? CurrentWarehouseIds : null;
        
        public static void SetWarehouseIdsByPriority(HttpContextBase context)
        {
            var warehouseIdHeader = context.Request.Headers["X-API-WAREHOUSES"];
            if (!string.IsNullOrWhiteSpace(warehouseIdHeader))
            {
                var ids = 
                    warehouseIdHeader
                        .Split(',')
                        .Select(x => x.TryParseInt())
                        .Where(x => x != 0 && WarehouseService.Exists(x, true))
                        .ToList();
                
                if (ids.Count > 0)
                {
                    CurrentWarehouseIds = ids;
                    return;
                }
            }
            
            if (context.Request["warehouseIds"] != null)
            {
                var ids = 
                    context.Request["warehouseIds"]
                        .Split(',')
                        .Select(x => x.TryParseInt())
                        .Where(x => x != 0 && WarehouseService.Exists(x, true))
                        .ToList();
                
                if (ids.Count > 0)
                {
                    CurrentWarehouseIds = ids;
                    return;
                }
            }
            
            var cookie = CommonHelper.GetCookieString(WarehouseService.CookieName);
            if (!string.IsNullOrWhiteSpace(cookie))
            {
                var cookieIds = 
                    HttpUtility.UrlDecode(cookie)
                        .Split(',')
                        .Select(x => x.TryParseInt())
                        .ToList();

                var ids = cookieIds.Where(x => x != 0 && WarehouseService.Exists(x, true)).ToList();
                
                if (ids.Count > 0)
                {
                    CurrentWarehouseIds = ids;
                    
                    if (cookieIds.Count != ids.Count)
                        WarehouseService.SetCookie(ids);
                    
                    return;
                }
            }

            // если куки нет, то ищем по городу
            var zone = IpZoneContext.CurrentZone;
            if (zone != null && zone.CityId != 0)
            {
                var ids = WarehouseCityService.GetWarehouseIds(zone.CityId);
                if (ids.Count > 0)
                {
                    CurrentWarehouseIds = ids;
                    // WarehouseService.SetCookie(ids);
                    return;
                }
            }
            
            var geoDomain = DomainGeoLocationService.GetCurrentGeoLocation();
            if (geoDomain != null)
            {
                var ids = DomainGeoLocationService.GetWarehouseIds(geoDomain.Id);
                if (ids.Count > 0)
                {
                    CurrentWarehouseIds = ids;
                    return;
                }
            }
        }
    }
}