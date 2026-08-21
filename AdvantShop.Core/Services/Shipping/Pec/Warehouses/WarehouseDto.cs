using System.Collections.Generic;

namespace AdvantShop.Shipping.Pec.Warehouses
{
    public class WarehouseDto
    {
        public string Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string BranchId { get; set; }
        public long BranchBitrixId { get; set; }
        public string DivisionId { get; set; }
        public string CityId { get; set; }
        public long? CityBitrixId { get; set; }
        public string Address { get; set; }
        public string AddressComment { get; set; }
        public string Phone { get; set; }
        public float Latitude { get; set; }
        public float Longitude { get; set; }
        public string WorkTimeStr { get; set; }
        public List<TimeWork> TimeWork { get; set; }
        public bool IsRestrictions { get; set; }
        public double? MaxDimension { get; set; }
        public float? MaxWeightPerPlace { get; set; }
        public double? MaxVolume { get; set; }
    }
}