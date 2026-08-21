using System;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap
{
    public class BoundsConverter
    {
        public BoundedBy Convert(BoundedBy bounds, TypeBound toTypeBounds)
        {
            bounds = bounds ?? throw new ArgumentNullException(nameof(bounds));

            if (bounds.TypeBound == toTypeBounds)
                return bounds;

            return new BoundedBy(
                upperCorner: new Point(
                    latitude: bounds.UpperCorner.Latitude,
                    longitude: bounds.LowerCorner.Longitude),
                lowerCorner: new Point(
                    latitude: bounds.LowerCorner.Latitude,
                    longitude: bounds.UpperCorner.Longitude),
                toTypeBounds);
        }
    }
}