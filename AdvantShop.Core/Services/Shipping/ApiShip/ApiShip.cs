using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Shipping;
using AdvantShop.Shipping.ApiShip.Api;
using AdvantShop.Repository;
using AdvantShop.Core.Services.Shipping.ApiShip.Api;
using AdvantShop.Core.Services.Shipping.ApiShip.DeliveryPoints;
using AdvantShop.Shipping.PointDelivery;

namespace AdvantShop.Shipping.ApiShip
{
    [ShippingKey("ApiShip")]
    public partial class ApiShip : BaseShippingWithCargo, IShippingLazyData
    {
        /* Боевая среда #
Адрес отправления запросов: https://api.apiship.ru/v1/
            Интерактивная документация доступна по адресу: https://api.apiship.ru/doc/
            PHP SDK доступен по адресу: https://github.com/apiship/apiship-sdk-php
            Тестовая среда #
Адрес отправления запросов: http://api.dev.apiship.ru/v1/
            Интерактивная документация доступна по адресу: http://api.dev.apiship.ru/doc/
            ЛК для тестовой среды: http://a.dev.apiship.ru/
            Логин и пароль для тестов: test */
        #region Ctor

        private readonly string _apiKey;
        private readonly string _cityFrom;
        private readonly bool _showPointsAsList;
        private readonly bool _showAddressComment;
        private readonly string _yaMapsApiKey;
        private readonly string _senderRegion;
        private readonly string _senderAddress;
        private readonly int _sendedCountry;
        private readonly ApiShipShippingService _apiShipService;
        public const string KeyTextSendOrder = "SendOrderApiShip";
        public const string KeyTextOrderIdApiShip = "OrderIdApiShip";

        public override string[] CurrencyIso3Available { get { return new[] { "RUB" }; } }

        public ApiShip(ShippingMethod method, ShippingCalculationParameters calculationParameters) : base(method, calculationParameters)
        {
            _apiKey = _method.Params.ElementOrDefault(ApiShipTemplate.ApiKey);
            _cityFrom = _method.Params.ElementOrDefault(ApiShipTemplate.CityFrom);
            _showPointsAsList = (method.Params.ElementOrDefault(ApiShipTemplate.ShowPointsAsList)?? "True").TryParseBool();
            _showAddressComment = method.Params.ElementOrDefault(ApiShipTemplate.ShowAddressComment).TryParseBool();
            _yaMapsApiKey = _method.Params.ElementOrDefault(ApiShipTemplate.YaMapsApiKey);
            _senderRegion = _method.Params.ElementOrDefault(ApiShipTemplate.SenderRegion);
            _senderAddress = _method.Params.ElementOrDefault(ApiShipTemplate.SenderAddress);
            _sendedCountry = int.Parse(method.Params.ElementOrDefault(ApiShipTemplate.SendedCountry) ?? "0");

            if (!string.IsNullOrEmpty(_apiKey))
                _apiShipService = new ApiShipShippingService(_apiKey);            
        }

        #endregion

        public string CityFrom => _cityFrom;
        public string YaMapsApiKey => _yaMapsApiKey;
        public bool ShowAddressComment => _showAddressComment;
        public bool ShowPointsAsList => _showPointsAsList;
        public string SenderRegion => _senderRegion;
        public string SenderAddress => _senderAddress;
        public ApiShipShippingService ApiShipService => _apiShipService;

        protected override IEnumerable<BaseShippingOption> CalcOptions(CalculationVariants calculationVariants)
        {
            var options = new List<BaseShippingOption>();

            var dimensionsInCentimeters = GetDimensions(rate: 10);
            var weightInGramms = GetTotalWeight(1000);
            
            string cityActual = _calculationParameters.City;
            var district = _calculationParameters.District;
            string region = _calculationParameters.Region;
            var country = _calculationParameters.Country;
            var countryIso2 = CountryService.GetCountryByName(country)?.Iso2;

            var tariffs = ApiShipService.GetApiShipTariffs();
            var providers = ApiShipService.GetApiShipProviders();   
            List<string> providerKeys = tariffs != null ? tariffs.Select(x => x.ProviderKey).Distinct().ToList() : new List<string>();
            
            var apiCalc = GetCalculator(countryIso2, region, cityActual, district, _totalPrice, dimensionsInCentimeters, weightInGramms, tariffs, calculationVariants);
            if (apiCalc == null)
                return options;

            if (apiCalc.DeliveryToPoint != null && calculationVariants.HasFlag(CalculationVariants.PickPoint))
            {
                var pointIds = new List<int>();
                foreach (var deliveryToPoint in apiCalc.DeliveryToPoint)
                foreach (var tariff in deliveryToPoint.Tariffs)
                    if (tariff.PointIds != null)
                        pointIds.AddRange(tariff.PointIds);
                
                var pointsDelivery = GetApiShipPoints(pointIds.Distinct().ToList());
                if (pointsDelivery.Count != 0)
                {
                    foreach (var deliveryToPoint in apiCalc.DeliveryToPoint)
                    {
                        foreach (var tariff in deliveryToPoint.Tariffs)
                        {
                            if (!tariff.DeliveryTypes.Contains(2))
                                continue;
                            if (tariff.DeliveryCost == 0)
                                continue;
                            
                            tariff.ProviderKey = deliveryToPoint.ProviderKey;
                            var provider = providers.FirstOrDefault(x => x.key == tariff.ProviderKey);
                            var option = GetOptionToPoint(tariff, pointsDelivery, provider, cityActual);
                            if (option == null)
                                continue;
                            options.Add(option);
                        }
                    }
                }
            }

            if (apiCalc.DeliveryToDoor != null && calculationVariants.HasFlag(CalculationVariants.Courier))
            {
                foreach (var deliveryToPoint in apiCalc.DeliveryToDoor)
                {
                    foreach (var tariff in deliveryToPoint.Tariffs)
                    {
                        if (!tariff.DeliveryTypes.Contains(1))
                            continue;
                        tariff.ProviderKey = deliveryToPoint.ProviderKey;
                        var provider = tariff != null ? providers.FirstOrDefault(x => x.key == tariff.ProviderKey) : null;
                        var option = GetOptionCourier(tariff, provider);
                        if (option == null)
                            continue;
                        options.Add(option);
                    }
                }
            }

            return options;
        }

        protected override IEnumerable<BaseShippingOption> CalcOptionsToPoint(string pointId)
        {
            var pointIdInt = pointId.TryParseInt();
            if (pointIdInt == 0)
                return null;

            var deliveryPoint = DeliveryPointService.Get(pointIdInt);
            if (deliveryPoint is null)
                return null;

            if (!deliveryPoint.Enabled)
                return null;

            if (deliveryPoint.AvailableOperation != (int) ApiShipTypeOpertionOnPoint.extradition
                && deliveryPoint.AvailableOperation != (int) ApiShipTypeOpertionOnPoint.receptionAndDelivery)
                return null;

            var weightInGramms = GetTotalWeight(1000);
  
            if (deliveryPoint.MaxWeight.HasValue
                && weightInGramms > deliveryPoint.MaxWeight)
                return null;

            if (deliveryPoint.MinWeight.HasValue
                && weightInGramms < deliveryPoint.MinWeight)
                return null;
            
            var dimensionsInInCentimeter = GetDimensions(rate:10);
            if (deliveryPoint.MaxSizeA != null
                && dimensionsInInCentimeter[2] > deliveryPoint.MaxSizeA)
                return null;
            if (deliveryPoint.MaxSizeB != null
                && dimensionsInInCentimeter[1] > deliveryPoint.MaxSizeB)
                return null;
            if (deliveryPoint.MaxSizeC != null
                && dimensionsInInCentimeter[0] > deliveryPoint.MaxSizeC)
                return null;

            var dimensionsSum = dimensionsInInCentimeter.Sum();
            if (deliveryPoint.MaxSizeSum != null
                && dimensionsSum > deliveryPoint.MaxSizeSum)
                return null;
            
            var volume = Math.Round(dimensionsInInCentimeter[0] * dimensionsInInCentimeter[1] * dimensionsInInCentimeter[2], 3);
            if (deliveryPoint.MaxVolume != null
                && volume > deliveryPoint.MaxVolume)
                return null;
                   
            string cityActual = deliveryPoint.City;
            var district = deliveryPoint.Area;
            string region = deliveryPoint.Region;
            var countryIso2 = deliveryPoint.CountryCode;

            var tariffs = ApiShipService.GetApiShipTariffs();
            if (tariffs is null
                || tariffs.Count == 0)
                return null;
            
            var providers = ApiShipService.GetApiShipProviders();   
            List<string> providerKeys = tariffs.Select(x => x.ProviderKey).Distinct().ToList();
                        
            var apiCalc = GetCalculator(countryIso2, region, cityActual, district, _totalPrice, dimensionsInInCentimeter, weightInGramms, tariffs, CalculationVariants.PickPoint);
            if (apiCalc?.DeliveryToPoint == null)
                return null;

            var shippingOptions = new List<BaseShippingOption>();
            var pointsDelivery = new List<DeliveryPointDto> {deliveryPoint};
            foreach (var deliveryToPoint in apiCalc.DeliveryToPoint)
            {
                foreach (var tariff in deliveryToPoint.Tariffs)
                {
                    if (!tariff.DeliveryTypes.Contains(2))
                        continue;
                    if (tariff.DeliveryCost == 0)
                        continue;
                                
                    tariff.ProviderKey = deliveryToPoint.ProviderKey;
                    var provider = providers.FirstOrDefault(x => x.key == tariff.ProviderKey);
                    var option = GetOptionToPoint(tariff, pointsDelivery, provider, cityActual);
                    if (option == null)
                        continue;
                    shippingOptions.Add(option);
                }
            }

            return shippingOptions;
        }
        
        public override IEnumerable<BaseShippingPoint> CalcShippingPoints(float topLeftLatitude, float topLeftLongitude, float bottomRightLatitude,
            float bottomRightLongitude)
        {
            if (_cityFrom.IsNullOrEmpty())
                return null;
            if (_apiKey.IsNullOrEmpty())
                return null;
            
            var dimensionsInInCentimeter = GetDimensions(rate:10);
            var dimensionsSum = dimensionsInInCentimeter.Sum();
            var volume = Math.Round(dimensionsInInCentimeter[0] * dimensionsInInCentimeter[1] * dimensionsInInCentimeter[2], 3);
            var weightInGramms = GetTotalWeight(1000);

            return DeliveryPointService.FindByBounds(_apiKey, topLeftLatitude, topLeftLongitude, bottomRightLatitude, bottomRightLongitude)
                                       .Where(x => x.Enabled)
                                       .Where(x =>
                                            x.AvailableOperation == (int) ApiShipTypeOpertionOnPoint.extradition
                                            || x.AvailableOperation == (int) ApiShipTypeOpertionOnPoint.receptionAndDelivery)
                                        // принимает такой вес посылки
                                       .Where(x => x.MinWeight == null || weightInGramms >= x.MinWeight)
                                       .Where(x => x.MaxWeight == null || weightInGramms <= x.MaxWeight)
                                        // принимает посылку таких габаритов
                                       .Where(x => x.MaxSizeA == null || dimensionsInInCentimeter[2] <= x.MaxSizeA)
                                       .Where(x => x.MaxSizeB == null || dimensionsInInCentimeter[1] <= x.MaxSizeB)
                                       .Where(x => x.MaxSizeC == null || dimensionsInInCentimeter[0] <= x.MaxSizeC)
                                       .Where(x => x.MaxSizeSum == null || dimensionsSum <= x.MaxSizeSum)
                                       .Where(x => x.MaxVolume == null || volume <= x.MaxVolume)
                                       .Select(CastPoint);
        }

        private BaseShippingOption GetOptionToPoint(
            ApiShipTariffToPoint tariffPoint, IList<DeliveryPointDto> pointsDelivery, ApiShipProvider provider,
            string cityActual)
        {
            BaseShippingOption option = null;
            var points =
                pointsDelivery
                        // из калькуляции возвращаются id пвз, которые подходят под весогабариты 
                   .Where(x => tariffPoint.PointIds.Contains(x.Id))
                   .Where(x =>
                        x.AvailableOperation == (int) ApiShipTypeOpertionOnPoint.extradition
                        || x.AvailableOperation == (int) ApiShipTypeOpertionOnPoint.receptionAndDelivery)
                   .OrderBy(x => x.Address)
                   .ToList();

            if (points.Count == 0)
                return null;

            DeliveryPointDto apiShipPointSelected = null;
            if (_calculationParameters.ShippingOption != null &&
                _calculationParameters.ShippingOption.ShippingType == AttributeHelper.GetAttributeValue<ShippingKeyAttribute, string>(this))
            {
                var selectedPoint = _calculationParameters.ShippingOption?.GetOrderPickPoint()?.PickPointId.TryParseInt(true);
                apiShipPointSelected =
                    selectedPoint is null
                        ? null
                        : points.FirstOrDefault(x => x.Id == selectedPoint.Value);
            }

            if (apiShipPointSelected is null)
                apiShipPointSelected = points.FirstOrDefault();


            if (!ShowPointsAsList && !YaMapsApiKey.IsNullOrEmpty())
            {
                var deliveryMapOption = new ApiShipPointDeliveryMapOption(_method, _totalPrice)
                {
                    CityTo = cityActual,
                    ProviderCode = provider.key ?? string.Empty,
                    TariffId = tariffPoint.TariffId.ToString(),
                    CurrentPoints = points.Select(CastPoint).ToList(),
                    SelectedPoint = CastPoint(apiShipPointSelected)
                };
                SetMapData(deliveryMapOption);

                option = deliveryMapOption;
            }
            else
            {
                var pointOption = new ApiShipPointOption(_method, _totalPrice)
                {
                    CityTo = cityActual,
                    ProviderCode = provider.key ?? string.Empty,
                    TariffId = tariffPoint.TariffId.ToString(),
                    CurrentPoints = points.Select(CastPoint).ToList(),
                    SelectedPoint = CastPoint(apiShipPointSelected)
                };
                option = pointOption;
            }
            option.HideAddressBlock = true;
            option.IsAvailablePaymentCashOnDelivery = option.SelectedPoint.AvailableCashOnDelivery.HasValue
                ? option.SelectedPoint.AvailableCashOnDelivery.Value
                : true;
            if (option.SelectedPoint.MaxCost > _totalPrice)
                option.IsAvailablePaymentCashOnDelivery = false;
            option.Name = string.Format("{0}{1}", 
                provider != null ? provider.name : tariffPoint.ProviderKey ?? option.Name,
                tariffPoint.TariffName.IsNotEmpty() ? $" ({tariffPoint.TariffName})" : "");
            option.DeliveryId = string.Format("{0}_{1}_{2}_PickPoint", 
                tariffPoint.TariffId ?? 0,
                string.Join(",", tariffPoint.PickupTypes.OrderBy(x => x)),
                string.Join(",", tariffPoint.DeliveryTypes.OrderBy(x => x))).GetHashCode(); // OrderBy потому что приходит в разном порядке
            option.Rate = (float)tariffPoint.DeliveryCost;
            option.DeliveryTime = 
                tariffPoint.DaysMin == tariffPoint.DaysMax 
                    ? $"{tariffPoint.DaysMin} дн." 
                    : $"{tariffPoint.DaysMin}-{tariffPoint.DaysMax} дн.";
            option.IconName = ShippingIcons.GetShippingIcon(option.ShippingType, _method.IconFileName?.PhotoName, option.Name);

            return option;
        }

        private BaseShippingOption GetOptionCourier(ApiShipTariffToDoor tariffToDoor, ApiShipProvider provider)
        {
            var option = new ApiShipCourierOption(_method, _totalPrice)
            {
                IsAvailablePaymentCashOnDelivery = true,
                ProviderKey = tariffToDoor.ProviderKey,
                TariffId = tariffToDoor.TariffId.ToString(),
                DeliveryId = $"{tariffToDoor.TariffId ?? 0}_{string.Join(",", tariffToDoor.PickupTypes.OrderBy(x => x))}_{string.Join(",", tariffToDoor.DeliveryTypes.OrderBy(x => x))}_Courier".GetHashCode() // OrderBy потому что приходит в разном порядке
            };
            option.Name = (provider != null ? provider.name : (tariffToDoor.ProviderKey ?? option.Name)) + (!tariffToDoor.TariffName.IsNullOrEmpty() ? " (" + tariffToDoor.TariffName + ")" : "");
            option.Rate = (float)tariffToDoor.DeliveryCost;
            option.DeliveryTime = tariffToDoor.DaysMin == tariffToDoor.DaysMax ? tariffToDoor.DaysMin.ToString() + " дн." : tariffToDoor.DaysMin + "-" + tariffToDoor.DaysMax + " дн.";
            option.IconName = ShippingIcons.GetShippingIcon(option.ShippingType, _method.IconFileName?.PhotoName, option.Name);
            return option;
        }

        private ApiShipCalculatorResponseModel GetCalculator(string countryIso2, string region, string city, string district, 
            float sumCost, float[] dimensionsSizes, float weight, List<ApiShipTariff> tariffs, CalculationVariants calculationVariants)
        {
            string defaultCountryIso2 = "RU";
            Country countryFrom = null;

            if (_sendedCountry > 0)
            {
                countryFrom = CountryService.GetCountry(_sendedCountry);
            }

            var model = new ApiShipCalculatorRequestModel
            {
                From = new ApiShipCalculatorObject
                {
                    CountryCode = countryFrom != null && countryFrom.CountryId > 0 ? countryFrom.Iso2 : defaultCountryIso2,
                    AddressString = !SenderAddress.IsNullOrEmpty() ? SenderAddress : string.Empty,
                    Region = !SenderRegion.IsNullOrEmpty() ? SenderRegion : string.Empty,
                    City = !CityFrom.IsNullOrEmpty() ? CityFrom : string.Empty
                },
                To = new ApiShipCalculatorObject
                {
                    CountryCode = countryIso2 ?? defaultCountryIso2,
                    Region = region ?? string.Empty,
                    City = city ?? string.Empty
                },
                Places = new List<ApiShipCalculatorPlaces>
                {
                    new ApiShipCalculatorPlaces
                    {
                        Height = (int)Math.Ceiling(dimensionsSizes[0]),
                        Length = (int)Math.Ceiling(dimensionsSizes[1]),
                        Width = (int)Math.Ceiling(dimensionsSizes[2]),
                        Weight = (int)Math.Ceiling(weight)
                    }
                },
                PickupDate = DateTime.Today.ToString("yyyy-MM-dd"),
                PickupTypes = new List<int>(),
                AssessedCost = (int)Math.Ceiling(sumCost),
                CodCost = (int)Math.Ceiling(sumCost),
                IncludeFees = false,
                Timeout = 9000,
                SkipTariffRules = false,
                // тарифы и провайдеры api возвращает все что поддерживает сервис, а не которые подключены
                // ProviderKeys = tariffs?.Select(x => x.ProviderKey).Distinct().ToList(),
                // TariffIds = tariffs?.Select(x => x.Id).ToList() ?? new List<int>()
                PromoCode = "",
                CustomCode = "",
            };

            model.DeliveryTypes = new List<int>();
            if (calculationVariants.HasFlag(CalculationVariants.Courier))
                model.DeliveryTypes.Add(1);
            if (calculationVariants.HasFlag(CalculationVariants.PickPoint))
                model.DeliveryTypes.Add(2);
            
            var calculatorResult = ApiShipService.GetCalculator(model);
            return calculatorResult;
        }

        private IList<DeliveryPointDto> GetApiShipPoints(List<int> pointIds)
        {
            // заодно загружаем постоматы, если они ранее не грузились
            if (!DeliveryPointService.ExistsDeliveryPoints(_apiKey))
                SyncPickPoints(_apiShipService, _apiKey);

            return DeliveryPointService.GetList(pointIds);

        }

        private void SetMapData(ApiShipPointDeliveryMapOption option)
        {
            string lang = "en_US";
            switch (Localization.Culture.Language)
            {
                case Localization.Culture.SupportLanguage.Russian:
                    lang = "ru_RU";
                    break;
                case Localization.Culture.SupportLanguage.English:
                    lang = "en_US";
                    break;
                case Localization.Culture.SupportLanguage.Ukrainian:
                    lang = "uk_UA";
                    break;
            }

            var city = _calculationParameters.City;
            var region = _calculationParameters.Region;
            var country = _calculationParameters.Country;

            option.MapParams = new MapParams();
            option.MapParams.Lang = lang;
            option.MapParams.YandexMapsApikey = YaMapsApiKey;
            option.MapParams.Destination = string.Join(", ", new[] { country, region, city }.Where(x => x.IsNotEmpty()));
            option.PointParams = new PointParams();
            option.PointParams.IsLazyPoints = (option.CurrentPoints?.Count ?? 0) > 30;
            option.PointParams.PointsByDestination = true;

            if (option.PointParams.IsLazyPoints)
            {
                option.PointParams.LazyPointsParams = new Dictionary<string, object>
                {
                    {
                        "ids", option.CurrentPoints != null
                            ? string.Join(",", option.CurrentPoints.Select(x => x.Id))
                            : string.Empty
                    },
                };
            }
            else
            {
                option.PointParams.Points = GetFeatureCollection(option.CurrentPoints);
            }
        }

        public override BaseShippingPoint LoadShippingPointInfo(string pointId)
        {
            if (pointId.IsNullOrEmpty())
                return null;

            var pointIdInt = pointId.TryParseInt();
            if (pointIdInt == 0)
                return null;

            var pointDto = DeliveryPointService.Get(pointIdInt);
            return pointDto != null
                ? CastPoint(pointDto)
                : null;
        }

        public FeatureCollection GetFeatureCollection(List<ApiShipShippingPoint> points)
        {
            return new FeatureCollection
            {
                Features = points.Select(p =>
                    new Feature
                    {
                        Id = Convert.ToInt32(p.Id),
                        Geometry = new PointGeometry { PointX = p.Latitude ?? 0f, PointY = p.Longitude ?? 0f },
                        Options = new PointOptions { Preset = "islands#dotIcon" },
                        Properties = new PointProperties
                        {
                            BalloonContentHeader = p.Address,
                            HintContent = p.Address,
                            BalloonContentBody =
                                string.Format("<a class=\"btn btn-xsmall btn-submit\" href=\"javascript:void(0)\" onclick=\"window.PointDeliveryMap({0}, '{1}')\">Выбрать</a>",
                                    p.Id,
                                    p.Id),
                            BalloonContentFooter = ShowAddressComment
                                ? p.Description
                                : null
                        }
                    }).ToList()
            };
        }

        public object GetLazyData(Dictionary<string, object> data)
        {
            if (data == null || !data.ContainsKey("ids") || data["ids"] == null)
                return null;

            var ids = 
                data["ids"].ToString()
                           .Split(",")
                           .Select(x => x.TryParseInt())
                           .Where(x => x != 0)
                           .ToList();
            var points =
                DeliveryPointService.GetList(ids)
                                    .Select(CastPoint)
                                    .ToList();
            return GetFeatureCollection(points);
        }

        public ApiShipShippingPoint CastPoint(DeliveryPointDto pointDto)
        {
            return new ApiShipShippingPoint
            {
                Id = pointDto.Id.ToString(),
                Code = pointDto.Code,
                Name = pointDto.Name,
                Address = pointDto.Address,
                Description = pointDto.Description,
                Latitude = pointDto.Latitude,
                Longitude = pointDto.Longitude,
                TimeWorkStr = pointDto.Timetable,
                TimeWork = pointDto.TimeWork,
                Phones = pointDto.Phone.IsNotEmpty()
                    ? new string[] {pointDto.Phone}
                    : null,
                AvailableCashOnDelivery = pointDto.Cod && pointDto.PaymentCash,
                AvailableCardOnDelivery = pointDto.Cod && pointDto.PaymentCard,
                MaxHeightInMillimeters = pointDto.MaxSizeA != null
                    ? MeasureUnits.ConvertLength(pointDto.MaxSizeA.Value, MeasureUnits.LengthUnit.Centimeter, MeasureUnits.LengthUnit.Millimeter)
                    : (float?) null,
                MaxWidthInMillimeters = pointDto.MaxSizeB != null
                    ? MeasureUnits.ConvertLength(pointDto.MaxSizeB.Value, MeasureUnits.LengthUnit.Centimeter, MeasureUnits.LengthUnit.Millimeter)
                    : (float?) null,
                MaxLengthInMillimeters = pointDto.MaxSizeC != null
                    ? MeasureUnits.ConvertLength(pointDto.MaxSizeC.Value, MeasureUnits.LengthUnit.Centimeter, MeasureUnits.LengthUnit.Millimeter)
                    : (float?) null,
                DimensionSumInMillimeters = pointDto.MaxSizeSum != null
                    ? MeasureUnits.ConvertLength(pointDto.MaxSizeSum.Value, MeasureUnits.LengthUnit.Centimeter, MeasureUnits.LengthUnit.Millimeter)
                    : (float?) null,
                DimensionVolumeInCentimeters = pointDto.MaxVolume,
                MaxWeightInGrams = pointDto.MaxWeight,
                MaxCost = pointDto.MaxCod,
            };
        }
    }
}