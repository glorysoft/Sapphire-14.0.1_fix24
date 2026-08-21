namespace AdvantShop.Areas.Api.Models.Warehouses
{
    public sealed class WarehouseGroupsFilter
    {
        public string City { get; set; }
        public int? CityId { get; set; }
        public int? CountryId { get; set; } 
        public int? RegionId { get; set; } 
    }
}