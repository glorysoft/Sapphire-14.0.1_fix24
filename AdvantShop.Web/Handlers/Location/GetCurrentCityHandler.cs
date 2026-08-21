using AdvantShop.Configuration;
using AdvantShop.Repository;

namespace AdvantShop.Handlers.Location
{
    public class GetCurrentCityHandler
    {
        public static City Execute()
        {
            
            var zone = IpZoneContext.CurrentZone;
            if (zone != null && zone.CityId != 0)
            {
                return CityService.GetCity(zone.CityId);
            }

            
            if (SettingsDesign.AutodetectCity)
            {
                return CityService.GetCityByName(IpZoneContext.CurrentZone.City);
            }
            
            if (SettingsDesign.DefaultCityIdIfNotAutodetect.HasValue)
            {
                var city = CityService.GetCity(SettingsDesign.DefaultCityIdIfNotAutodetect.Value);
                if (city != null)
                    return city;
            }
            
            return null;
        }
    }
}