using System;

namespace AdvantShop.Models.Warehouse
{
    public class WarehouseCityModel
    {
        public string City { get; set; }
        public int? CityId { get; set; }
        
        public override bool Equals(object obj)
        {
            if (obj is WarehouseCityModel other)
            {
                return CityId == other.CityId && City == other.City;
            }
            return false;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(CityId, City);
        }
    }
}