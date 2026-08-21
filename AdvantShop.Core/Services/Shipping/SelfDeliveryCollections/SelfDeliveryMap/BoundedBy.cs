using System;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap
{
    public class BoundedBy
    {
        /// <exception cref="ArgumentException"></exception>
        public BoundedBy(Point upperCorner, Point lowerCorner, TypeBound typeBound)
        {
            if (upperCorner.Latitude == lowerCorner.Latitude)
                throw new ArgumentException(
                    "Широта верхнего и нижнего края области не должны быть равны", nameof(upperCorner));
            
            if (upperCorner.Longitude == lowerCorner.Longitude)
                throw new ArgumentException(
                    "Долгота верхнего и нижнего края области не должны быть равны", nameof(upperCorner));

            if (upperCorner.Latitude < lowerCorner.Latitude)
                throw new ArgumentException(
                    "Широта верхнего края области не может находиться ниже нижнего края области", nameof(upperCorner));
            
            if (typeBound == TypeBound.TopToBottom 
                && upperCorner.Longitude > lowerCorner.Longitude
                && (Math.Sign(upperCorner.Longitude) != 1 // не проходит через линию разделения дат/полушарий
                    || Math.Sign(lowerCorner.Longitude) != -1))
                throw new ArgumentException(
                    "Долгота верхнего края области не может находиться правее нижнего края области", nameof(upperCorner));

            if (typeBound == TypeBound.BottomToTop
                && lowerCorner.Longitude > upperCorner.Longitude 
                && (Math.Sign(lowerCorner.Longitude) != 1 // не проходит через линию разделения дат/полушарий
                    || Math.Sign(upperCorner.Longitude) != -1))
                throw new ArgumentException(
                    "Долгота нижнего края области не может находиться правее верхнего края области", nameof(lowerCorner));

            UpperCorner = upperCorner;
            LowerCorner = lowerCorner;
            TypeBound = typeBound;
        }

        public Point UpperCorner { get; }
        public Point LowerCorner { get; }
        public TypeBound TypeBound { get; }
    }
}