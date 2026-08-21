using System;
using System.Collections.Generic;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap
{
    public class BoundsServiceBySquareCell : IBoundsService<Square>
    {
        public IReadOnlyCollection<Square> BoundsToCellOfMapCollection(BoundedBy bounds)
        {
            var (latitudeStart, latitudeEnd, longitudeStart, longitudeEnd) = GetParamsForFinger(bounds);

            var countCell = _GetCountCellsByBounds(latitudeStart, latitudeEnd, longitudeStart, longitudeEnd);
            
            if (countCell == 0)
                return Array.Empty<Square>();
            
            var listCell = new List<Square>(countCell);

            for (decimal latitude = latitudeStart; latitude > latitudeEnd; latitude -= Square.Size) //сверху вних
                if (Math.Sign(longitudeStart) == 1
                    && Math.Sign(longitudeEnd) == -1)
                {
                    // проходит через линию разделения дат/полушарий
                    for (decimal longitude = longitudeStart; longitude < 180; longitude += Square.Size) // слева на право
                        listCell.Add(GetCellOfMapByPoint(latitude, longitude));
                    for (decimal longitude = -180; longitude < longitudeEnd; longitude += Square.Size) // слева на право
                        listCell.Add(GetCellOfMapByPoint(latitude, longitude));
                }
                else
                    for (decimal longitude = longitudeStart; longitude < longitudeEnd; longitude += Square.Size) // слева на право
                        listCell.Add(GetCellOfMapByPoint(latitude, longitude));

            return listCell;
        }

        public int GetCountCellsByBounds(BoundedBy bounds)
        {
            var (latitudeStart, latitudeEnd, longitudeStart, longitudeEnd) = GetParamsForFinger(bounds);

            return _GetCountCellsByBounds(latitudeStart, latitudeEnd, longitudeStart, longitudeEnd);
        }

        private static int _GetCountCellsByBounds(decimal latitudeStart, decimal latitudeEnd, decimal longitudeStart,
            decimal longitudeEnd)
        {
            int countCell;
            if (Math.Sign(longitudeStart) == 1
                && Math.Sign(longitudeEnd) == -1)
            {
                // проходит через линию разделения дат/полушарий
                var countCellsByLatitude = (int) Math.Ceiling((latitudeStart - latitudeEnd) / Square.Size);
                
                countCell = countCellsByLatitude
                            * (int) Math.Ceiling((180m - longitudeStart) / Square.Size);
                
                countCell += countCellsByLatitude
                             * (int) Math.Ceiling((longitudeEnd - -180m) / Square.Size);
            }
            else
                countCell = (int) Math.Ceiling((latitudeStart - latitudeEnd) / Square.Size)
                            * (int) Math.Ceiling((longitudeEnd - longitudeStart) / Square.Size);

            return countCell;
        }

        private (decimal latitudeStart, decimal latitudeEnd, decimal longitudeStart, decimal longitudeEnd)
            GetParamsForFinger(BoundedBy bounds)
        {
            decimal latitudeStart, latitudeEnd;
            decimal longitudeStart, longitudeEnd;

            latitudeStart = CorrectLatitude(bounds.UpperCorner.Latitude);
            latitudeEnd = CorrectLatitude(bounds.LowerCorner.Latitude);

            longitudeStart = bounds.TypeBound == TypeBound.TopToBottom
                ? CorrectLongitude(bounds.UpperCorner.Longitude)
                : CorrectLongitude(bounds.LowerCorner.Longitude);
            longitudeEnd = bounds.TypeBound == TypeBound.TopToBottom
                ? CorrectLongitude(bounds.LowerCorner.Longitude)
                : CorrectLongitude(bounds.UpperCorner.Longitude);
            return (latitudeStart, latitudeEnd, longitudeStart, longitudeEnd);
        }

        private decimal CorrectLatitude(decimal latitude)
        {
            if (latitude > 90m)
                latitude = 90m;
            
            if (latitude < -90m)
                latitude = -90m;
            
            return latitude;
        }

        private decimal CorrectLongitude(decimal longitude)
        {
            if (longitude > 180m)
                longitude = 180m;
            
            if (longitude < -180m)
                longitude = -180m;
            
            return longitude;
        }

        public Square GetCellOfMapByPoint(Point point) => 
            GetCellOfMapByPoint(point.Latitude, point.Longitude);

        public Square GetCellOfMapByPoint(decimal latitude, decimal longitude)
        {
            return new Square(
                upperCornerLatitude: Math.Ceiling(latitude / Square.Size) * Square.Size,
                upperCornerLongitude: Math.Floor(longitude / Square.Size) * Square.Size);
        }

        public BoundedBy AdjustBoundsUsingCellsOfMap(BoundedBy bounds)
        {
            var boundsUpperCorner =
                GetCellOfMapByPoint(bounds.UpperCorner)
                   .GetBounds(bounds.TypeBound);
            var boundsLowerCorner =
                GetCellOfMapByPoint(bounds.LowerCorner)
                   .GetBounds(bounds.TypeBound);

            return new BoundedBy(
                boundsUpperCorner.UpperCorner,
                boundsLowerCorner.LowerCorner,
                bounds.TypeBound);
        }
    }
}