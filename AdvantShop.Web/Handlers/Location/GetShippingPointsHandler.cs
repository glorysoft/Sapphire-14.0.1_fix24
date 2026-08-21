using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap;
using AdvantShop.Models.Location;
using AdvantShop.Repository;
using AdvantShop.Repository.Currencies;
using AdvantShop.Shipping;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.Location
{
    public class GetShippingPointsHandler : ICommandHandler<ShippingPointsResultModel>
    {
        private readonly int _cityId;

        public GetShippingPointsHandler(int cityId)
        {
            _cityId = cityId;
        }

        public ShippingPointsResultModel Execute()
        {
            var city = CityService.GetCity(_cityId);
            if (city == null)
                return new ShippingPointsResultModel();
            
            var cityName = city.Name;
            var district  = city.District;
            var region = RegionService.GetRegion(city.RegionId);
            var regionName = region.Name;
            var country = CountryService.GetCountry(region.CountryId);
            var countryName = country.Name;

            var shippingsPoints = new List<ShippingPoints>();
            var shippingManager = new ShippingManager(config => config
                                                               .WithCountry(countryName)
                                                               .WithRegion(regionName)
                                                               .WithDistrict(district)
                                                               .WithCity(cityName)
                                                               .WithPreOrderItems(new List<PreOrderItem>())
                                                               .WithCurrency(CurrencyService.CurrentCurrency)
                                                               .Build());
            shippingManager.AddRule(
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

            var boundedBy = new BoundedBy(
                new Point(90m, -180m),
                new Point(-90m, 180m),
                TypeBound.TopToBottom);
            foreach (var pointsResult in shippingManager.GetShippingPoints(boundedBy, false))
            {
                if (!(pointsResult.Points?.Any() ?? false))
                    continue;

                var points =
                    pointsResult.Points
                                .Select(ShippingPoint.CreateBy)
                                .ToList();
                
                if (points is null
                    || points.Count == 0)
                    continue;

                shippingsPoints.Add(new ShippingPoints
                {
                    MethodId = pointsResult.MethodId,
                    Points = points
                });
            }

            return new ShippingPointsResultModel
            {
                ShippingsPoints = shippingsPoints,
            };
        }
    }
}