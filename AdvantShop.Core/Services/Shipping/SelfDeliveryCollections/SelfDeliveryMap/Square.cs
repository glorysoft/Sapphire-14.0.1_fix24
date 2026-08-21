using System;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap
{
    /// <summary>
    /// Ячейка карты в виде квадрата с координатами верхней левой точки на северо-западе  
    /// </summary>
    public class Square : ICellOfMap
    {
        public Square(decimal upperCornerLatitude, decimal upperCornerLongitude)
        {
            UpperCornerLatitude = upperCornerLatitude;
            UpperCornerLongitude = upperCornerLongitude;
        }

        /// <summary>
        /// 5/100 градуса (примерно 5.5 км)
        /// </summary>
        public const decimal Size = 0.05m;
        
        public decimal UpperCornerLatitude { get; }
        public decimal UpperCornerLongitude { get; }

        private BoundedBy _bounds;
        public BoundedBy GetBounds(TypeBound typeBound)
        {
            return _bounds ?? (_bounds = _GetBounds(typeBound));
        }

        private BoundedBy _GetBounds(TypeBound typeBound)
        {
            return typeBound == TypeBound.TopToBottom
                ? new BoundedBy(
                    upperCorner: new Point(UpperCornerLatitude, UpperCornerLongitude),
                    lowerCorner: new Point(UpperCornerLatitude - Size, UpperCornerLongitude + Size),
                    TypeBound.TopToBottom)
                : new BoundedBy(
                    upperCorner: new Point(UpperCornerLatitude, UpperCornerLongitude + Size),
                    lowerCorner: new Point(UpperCornerLatitude - Size, UpperCornerLongitude),
                    TypeBound.BottomToTop);
        }

        public bool IsVisible(Point point) => 
            IsVisible(point.Latitude, point.Longitude);

        public bool IsVisible(decimal latitude, decimal longitude)
        {
            return UpperCornerLatitude >= latitude
                   && UpperCornerLongitude <= longitude
                   && UpperCornerLatitude - Size < latitude
                   && UpperCornerLongitude + Size > longitude;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(UpperCornerLatitude, UpperCornerLongitude, Size);
        }
    }
}