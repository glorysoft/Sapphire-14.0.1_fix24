using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Services.Shipping;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Models.Location;
using AdvantShop.Repository;
using AdvantShop.Repository.Currencies;
using AdvantShop.Shipping;
using AdvantShop.Web.Infrastructure.Handlers;
using MethodDeliveryByZones = AdvantShop.Shipping.DeliveryByZones.DeliveryByZones;

namespace AdvantShop.Handlers.Location
{
    public class GetDeliveryZonesHandler : ICommandHandler<DeliveryZones>
    {
        private readonly int? _cityId;

        private readonly string _shippingTypeOfDeliveryByZones =
            AttributeHelper.GetAttributeValue<ShippingKeyAttribute, string>(typeof(MethodDeliveryByZones));

        public GetDeliveryZonesHandler(int? cityId)
        {
            _cityId = cityId;
        }

        public DeliveryZones Execute()
        {
            var shippingCalculationParameters = GetShippingCalculationParameters(_cityId);
            var shippingManager =
                new ShippingManager(shippingCalculationParameters)
                   .AddRule(new Rule(
                        new[]
                        {
                            // все методы НЕ DeliveryByZones
                            new FilterByType(_shippingTypeOfDeliveryByZones, false)
                        },
                        new[]
                        {
                            // Исключить
                            new SwitchOffEditor()
                        }));
            
            var deliveryZonesResponseItems =
                shippingManager.GetAvailableMethods()
                               .Select(x =>
                                {
                                    var deliveryByZones = CreateDeliveryByZones(x, shippingCalculationParameters);
                                    if (deliveryByZones.Zones is null
                                        || deliveryByZones.Zones.Count == 0)
                                        return null;
                                    
                                    return new DeliveryZonesResponseItem(
                                        x.ShippingMethodId,
                                        CreateFeatureCollection(deliveryByZones));
                                })
                               .ToList();

            var result = new DeliveryZones();
            result.AddRange(deliveryZonesResponseItems);
            return result;
        }

        private static FeatureCollection CreateFeatureCollection(MethodDeliveryByZones deliveryByZones)
        {
            return new FeatureCollection
            {
                MetaData = new MetaData()
                {
                    Creator = "advantshop",
                    Name = "DeliveryZones"
                },
                Features = deliveryByZones.Zones.Select(zone =>
                    new Feature {
                        Id = zone.Id,
                        Geometry = new PointGeometry { Coordinates = zone.Coordinates},
                        Properties = new PolygonProperties
                        {
                            DeliveryTime = zone.DeliveryTime,
                            Description = zone.Description,
                            FillColor = zone.FillColor,
                            FillOpacity = zone.FillOpacity,
                            StrokeColor = zone.StrokeColor,
                            StrokeOpacity = zone.StrokeOpacity,
                            StrokeWidth = zone.StrokeWidth,
                        }
                    }).ToList()
            };
        }

        private MethodDeliveryByZones CreateDeliveryByZones(ShippingMethod method, ShippingCalculationParameters shippingCalculationParameters)
        {
            if (!string.Equals(method.ShippingType, _shippingTypeOfDeliveryByZones, StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Type shipping method is not 'DeliveryByZones'", nameof(method));
            return new MethodDeliveryByZones(method, shippingCalculationParameters);
        }

        private ShippingCalculationParameters GetShippingCalculationParameters(int? cityId)
        {
            var city = 
                cityId.HasValue 
                    ? CityService.GetCity(cityId.Value) 
                    : null;
            var region = city is null ? null : RegionService.GetRegion(city.RegionId);
            var country = region is null ? null : CountryService.GetCountry(region.CountryId);

            return ShippingCalculationConfigurator
                  .Configure()
                  .WithCity(city?.Name)
                  .WithDistrict(city?.District)
                  .WithZip(city?.Zip)
                  .WithRegion(region?.Name)
                  .WithCountry(country?.Name)
                  .WithPreOrderItems(new List<PreOrderItem>())
                  .WithCurrency(CurrencyService.CurrentCurrency)
                  .Build();
        }
    }
}