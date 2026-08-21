using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Shipping;

namespace AdvantShop.Models.Location
{
    public class ShippingPointsByBoundsModel: ShippingPointsResultModel
    {
        public ICollection<Cell> Cells { get; set; }
    }
    
    public class ShippingPointsResultModel
    {
        public ICollection<ShippingPoints> ShippingsPoints { get; set; }
    }

    public class ShippingPoints
    {
        public int MethodId { get; set; }
        public IReadOnlyCollection<ShippingPoint> Points { get; set; }
    }

    public class ShippingPoint
    {
        public static ShippingPoint CreateBy(BaseShippingPoint baseShippingPoint)
        {
            return new ShippingPoint()
            {
                Id = baseShippingPoint.Id,
                Code = baseShippingPoint.Code,
                Name = baseShippingPoint.Name,
                Address = baseShippingPoint.Address,
                AddressComment = baseShippingPoint.AddressComment,
                Description = baseShippingPoint.Description,
                Latitude = baseShippingPoint.Latitude ?? 0f,
                Longitude = baseShippingPoint.Longitude ?? 0f,
                Phones = baseShippingPoint.Phones,
                TimeWorkStr = baseShippingPoint.TimeWorkStr,
                TimeWork =
                    baseShippingPoint.TimeWork
                                    ?.Select(x =>
                                          new TimeWork
                                          {
                                              From = x.From,
                                              To = x.To,
                                              Label = x.Label
                                          })
                                     .ToList(),
                WarehouseId = baseShippingPoint.WarehouseId,
            };
        }
        
        public string Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string AddressComment { get; set; }
        public string Description { get; set; }
        public float Latitude { get; set; }
        public float Longitude { get; set; }
        public string[] Phones { get; set; }
        public string TimeWorkStr { get; set; }
        public List<TimeWork> TimeWork { get; set; }
        public int? WarehouseId { get; set; }
    }
    
    public class TimeWork
    {
        public string Label { get; set; }
        public TimeSpan From { get; set; }
        public TimeSpan To { get; set; }
    }

    public class Cell
    {
        public Cell(decimal upperCornerLatitude, decimal upperCornerLongitude, decimal lowerCornerLatitude, decimal lowerCornerLongitude)
        {
            UpperCornerLatitude = upperCornerLatitude;
            UpperCornerLongitude = upperCornerLongitude;
            LowerCornerLatitude = lowerCornerLatitude;
            LowerCornerLongitude = lowerCornerLongitude;
        }

        public decimal UpperCornerLatitude { get; }
        public decimal UpperCornerLongitude { get; }
        public decimal LowerCornerLatitude { get; }
        public decimal LowerCornerLongitude { get; }
    }
}