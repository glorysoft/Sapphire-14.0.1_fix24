using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap;
using AdvantShop.Models.Location;
using AdvantShop.Repository.Currencies;
using AdvantShop.Shipping;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.Location
{
    public class GetShippingPointsByBoundsHandler : ICommandHandler<ShippingPointsByBoundsModel>
    {
        private readonly float _bottomLeftLatitude;
        private readonly float _bottomLeftLongitude;
        private readonly float _topRightLatitude;
        private readonly float _topRightLongitude;

        public GetShippingPointsByBoundsHandler(float bottomLeftLatitude, float bottomLeftLongitude, float topRightLatitude, float topRightLongitude)
        {
            _bottomLeftLatitude = bottomLeftLatitude;
            _bottomLeftLongitude = bottomLeftLongitude;
            _topRightLatitude = topRightLatitude;
            _topRightLongitude = topRightLongitude;
        }

        public ShippingPointsByBoundsModel Execute()
        {
            var selfDeliveryMapManager = new SelfDeliveryMapManager(
                calculation => calculation
                              .WithPreOrderItems(new List<PreOrderItem>())
                              .WithCurrency(CurrencyService.CurrentCurrency)
                              .Build());
            selfDeliveryMapManager.AddRule(
                new Rule(
                    new[]
                    {
                        // все методы НЕ SelfDelivery и PointDelivery
                        new FilterByType(
                            new[] {"SelfDelivery", "PointDelivery"},
                            false)
                    },
                    new[]
                    {
                        // Исключить
                        new SwitchOffEditor()
                    }));

            var shippingPointsResults =
                selfDeliveryMapManager.GetShippingPoints(
                    new BoundedBy(
                        upperCorner: new Point(
                            latitude: (decimal) _topRightLatitude,
                            longitude: (decimal) _topRightLongitude),
                        lowerCorner: new Point(
                            latitude: (decimal) _bottomLeftLatitude,
                            longitude: (decimal) _bottomLeftLongitude),
                        TypeBound.BottomToTop),
                    out var cells);

            return new ShippingPointsByBoundsModel()
            {
                ShippingsPoints =
                    shippingPointsResults
                       .Select(
                            s =>
                                new ShippingPoints
                                {
                                    MethodId = s.MethodId,
                                    Points = s.Points
                                              .Select(ShippingPoint.CreateBy)
                                              .ToList()
                                })
                       .ToList(),
                Cells = cells
                   .Select(x =>
                        new Cell(
                            x.UpperCornerLatitude,
                            x.UpperCornerLongitude,
                            x.UpperCornerLatitude - Square.Size, 
                            x.UpperCornerLongitude + Square.Size))
                       .ToList()
            };
        }
    }
}