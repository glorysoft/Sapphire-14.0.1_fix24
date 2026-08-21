using AdvantShop.Configuration;
using AdvantShop.Core.Services.Domains;

namespace AdvantShop.Catalog
{
    public static class CategoryExtensions
    {
        public static string GetCategoryDescriptionFormatted(this Category category, string geoName = null) => 
            category.Description.Replace("#GEO_NAME#", geoName ?? DomainGeoLocationService.GetCurrentGeoLocation()?.GeoName ?? SettingsMain.City);

        public static string GetCategoryBriefDescriptionFormatted(this Category category, string geoName = null) => 
            category.BriefDescription.Replace("#GEO_NAME#", geoName ?? DomainGeoLocationService.GetCurrentGeoLocation()?.GeoName ?? SettingsMain.City);
    }
}
