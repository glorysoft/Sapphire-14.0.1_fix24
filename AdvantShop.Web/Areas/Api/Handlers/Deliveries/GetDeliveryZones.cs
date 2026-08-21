using System.Collections.Generic;
using System.Linq;
using AdvantShop.Areas.Api.Models.Deliveries;
using AdvantShop.Core.Common;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Services.Shipping;
using AdvantShop.Repository;
using AdvantShop.Repository.Currencies;
using AdvantShop.Shipping;
using AdvantShop.Shipping.DeliveryByZones;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Deliveries
{
    public class GetDeliveryZones : AbstractCommandHandler<GetDeliveryZonesResponse>
    {
        private readonly DeliveryZonesFilter _model;

        public GetDeliveryZones(DeliveryZonesFilter model)
        {
            _model = model;
        }

        protected override GetDeliveryZonesResponse Handle()
        {
            var shippingCalculationParameters = GetShippingCalculationParameters();

            var deliveryZonesResponseItems =
                GetShippings(shippingCalculationParameters)
                   .Select(x =>
                    {
                        var deliveryByZones = CreateDeliveryByZones(x, shippingCalculationParameters);
                        return new DeliveryZonesResponseItem(x, deliveryByZones);
                    })
                   .ToList();

            return new GetDeliveryZonesResponse(deliveryZonesResponseItems);
        }
    
        private static DeliveryByZones CreateDeliveryByZones(ShippingMethod method, ShippingCalculationParameters shippingCalculationParameters) => 
            new DeliveryByZones(method, shippingCalculationParameters);

        private List<ShippingMethod> GetShippings(ShippingCalculationParameters shippingCalculationParameters)
        {
            var items = new List<ShippingMethod>();
            var deliveryByZonesShippingKey = AttributeHelper.GetAttributeValue<ShippingKeyAttribute, string>(typeof(DeliveryByZones));
            var shippings = 
                ShippingMethodService.GetAllShippingMethods(true)
                                     .Where(x => x.ShippingType == deliveryByZonesShippingKey);

            foreach (var shipping in shippings)
            {
                var validGeo = false;
                
                if (ShippingPaymentGeoMaping.IsExistGeoShipping(shipping.ShippingMethodId))
                {
                    if (ShippingPaymentGeoMaping.CheckShippingEnabledGeo(
                            shipping.ShippingMethodId, 
                            shippingCalculationParameters.Country, 
                            shippingCalculationParameters.Region, 
                            shippingCalculationParameters.City, 
                            shippingCalculationParameters.District))
                        validGeo = true;
                }
                else
                    validGeo = true;

                if (validGeo)
                    items.Add(shipping);
            }

            return items;
        }

        private ShippingCalculationParameters GetShippingCalculationParameters()
        {
            City city = null;
            Region region = null;
            Country country = null;

            if (_model != null)
            {
                region = !string.IsNullOrWhiteSpace(_model.Region)
                    ? RegionService.GetRegionByName(_model.Region)
                    : null;

                country = !string.IsNullOrWhiteSpace(_model.Country)
                    ? CountryService.GetCountryByName(_model.Country)
                    : null;

                if (!string.IsNullOrWhiteSpace(_model.Zip))
                    city = CityService.GetCityByZip(_model.Zip);

                if (city == null && !string.IsNullOrWhiteSpace(_model.City) && region != null)
                    city = CityService.GetCityByName(_model.City, region.RegionId);

                if (city == null && !string.IsNullOrWhiteSpace(_model.City))
                    city = CityService.GetCityByName(_model.City);

                if (country == null && region != null)
                    country = CountryService.GetCountry(region.CountryId);
            }

            return ShippingCalculationConfigurator
                  .Configure()
                  .WithCountry(country?.Name ?? "")
                  .WithRegion(region?.Name ?? "")
                  .WithCity(city?.Name ?? "")
                  .WithDistrict(_model?.District ?? "")
                  .WithPreOrderItems(new List<PreOrderItem>())
                  .WithCurrency(CurrencyService.CurrentCurrency)
                  .Build();
        }
    
    }
}