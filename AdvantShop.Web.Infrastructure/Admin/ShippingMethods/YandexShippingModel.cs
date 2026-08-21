using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web.Mvc;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Shipping;
using AdvantShop.Diagnostics;
using AdvantShop.Payment;
using AdvantShop.Shipping.Yandex;
using AdvantShop.Shipping.Yandex.Api;
using AdvantShop.Shipping.Yandex.PickupPoints;

namespace AdvantShop.Web.Infrastructure.Admin.ShippingMethods
{
    [ShippingAdminModel("Yandex")]
    public class YandexShippingModel : ShippingMethodAdminModel, IValidatableObject
    {
        public string StationId
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.StationId); }
            set { Params.TryAddValue(YandexDeliveryTemplate.StationId, value.DefaultOrEmpty()); }
        }

        public string ApiToken
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.ApiToken); }
            set
            {
                if (value.IsNotEmpty())
                {
                    var apiService = new YandexDeliveryApiService(string.Empty, value, TestMode);
                    
                    // заодно загружаем постоматы, если они ранее не грузились
                    if (!PickupPointService.ExistsPickupPoints())
                        YandexDelivery.SyncPickPoints(apiService);

                }
                Params.TryAddValue(YandexDeliveryTemplate.ApiToken, value.DefaultOrEmpty());
            }
        }

        public string PaymentCodCardId
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.PaymentCodCardId); }
            set { Params.TryAddValue(YandexDeliveryTemplate.PaymentCodCardId, value.TryParseInt(true).ToString() ?? string.Empty); }
        }

        public string PaymentCodCashId
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.PaymentCodCashId); }
            set { Params.TryAddValue(YandexDeliveryTemplate.PaymentCodCashId, value.TryParseInt(true).ToString() ?? string.Empty); }
        }

        public List<SelectListItem> PaymentsCod
        {
            get
            {
                var paymentsCod = PaymentService.GetAllPaymentMethods(false)
                    .Where(x => x.PaymentKey.Equals("CashOnDelivery", StringComparison.OrdinalIgnoreCase)
                                && x.Parameters.TryGetValue("ShippingMethod", out var shippingMethodId)
                                && shippingMethodId.TryParseInt() == ShippingMethodId)
                    .Select(x => new SelectListItem() { Text = x.Name, Value = x.PaymentMethodId.ToString() })
                    .ToList();

                paymentsCod.Insert(0, new SelectListItem() { Text = "-", Value = string.Empty });

                return paymentsCod;
            }
        }

        public string[] DeliveryTypes
        {
            get { return (Params.ElementOrDefault(YandexDeliveryTemplate.DeliveryTypes) ?? string.Empty).Split(","); }
            set { Params.TryAddValue(YandexDeliveryTemplate.DeliveryTypes, value != null ? string.Join(",", value) : string.Empty); }
        }

        public List<SelectListItem> ListDeliveryTypes
        {
            get
            {
                var listDeliveryTypes = new List<SelectListItem>();

                foreach (var delivertyType in DeliveryType.AsList())
                {
                    listDeliveryTypes.Add(new SelectListItem()
                    {
                        Text = delivertyType.Localize(),
                        Value = delivertyType.Value
                    });
                }

                return listDeliveryTypes;
            }
        }

        public string YaMapsApiKey
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.YaMapsApiKey); }
            set { Params.TryAddValue(YandexDeliveryTemplate.YaMapsApiKey, value.DefaultOrEmpty()); }
        }

        public string City
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.City); }
            set { Params.TryAddValue(YandexDeliveryTemplate.City, value.DefaultOrEmpty()); }
        }

        public int? CityGeoId
        {
            get
            {
                var geoId = Params.ElementOrDefault(YandexDeliveryTemplate.CityGeoId).TryParseInt(true);
                if (geoId.HasValue)
                    return geoId.Value;

                var apiService = new YandexDeliveryApiService(String.Empty, ApiToken, TestMode);
                var geoIds = apiService.GetCityGeoId(City);
                
                geoId = geoIds?.Variants?.FirstOrDefault()?.GeoId;
                if (geoId.HasValue)
                    Params.TryAddValue(YandexDeliveryTemplate.CityGeoId, geoId.Value.ToString());
            
                return geoId;
            }
            set { Params.TryAddValue(YandexDeliveryTemplate.CityGeoId, value.ToString()); }
        }

        public string TypeViewPoints
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.TypeViewPoints, ((int)Shipping.Yandex.TypeViewPoints.YaMap).ToString()); }
            set { Params.TryAddValue(YandexDeliveryTemplate.TypeViewPoints, value.DefaultOrEmpty()); }
        }

        public List<SelectListItem> ListTypesViewPoints
        {
            get
            {
                return Enum.GetValues(typeof(TypeViewPoints))
                    .Cast<TypeViewPoints>()
                    .Select(x => new SelectListItem()
                    {
                        Text = x.Localize(),
                        Value = ((int)x).ToString()
                    })
                    .ToList();
            }
        }

        public string PostOfficeTypeViewPoints
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.PostOfficeTypeViewPoints, ((int)Shipping.Yandex.TypeViewPoints.YaMap).ToString()); }
            set { Params.TryAddValue(YandexDeliveryTemplate.PostOfficeTypeViewPoints, value.DefaultOrEmpty()); }
        }

        public List<SelectListItem> ListPostOfficeTypesViewPoints
        {
            get
            {
                return Enum.GetValues(typeof(TypeViewPoints))
                    .Cast<TypeViewPoints>()
                    .Where(x => x != Shipping.Yandex.TypeViewPoints.YaWidget)
                    .Select(x => new SelectListItem()
                    {
                        Text = x.Localize(),
                        Value = ((int)x).ToString()
                    })
                    .ToList();
            }
        }

        public string TypeDeparturePoint
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.TypeDeparturePoint, ((int)Shipping.Yandex.TypeDeparturePoint.Station).ToString()); }
            set { Params.TryAddValue(YandexDeliveryTemplate.TypeDeparturePoint, value.DefaultOrEmpty()); }
        }

        public List<SelectListItem> ListTypesDeparturePoint
        {
            get
            {
                return Enum.GetValues(typeof(TypeDeparturePoint))
                    .Cast<TypeDeparturePoint>()
                    .Select(x => new SelectListItem()
                    {
                        Text = x.Localize(),
                        Value = ((int)x).ToString()
                    })
                    .ToList();
            }
        }

        public string ReceptionPoint
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.ReceptionPoint); }
            set { Params.TryAddValue(YandexDeliveryTemplate.ReceptionPoint, value.DefaultOrEmpty()); }
        }

        public List<SelectListItem> ListReceptionPoints
        {
            get
            {
                if (ApiToken.IsNullOrEmpty())
                    return new List<SelectListItem> { new SelectListItem { Text = "Не сохранен Токен Api" } };

                if (City.IsNullOrEmpty())
                    return new List<SelectListItem> { new SelectListItem { Text = "Не сохранен город отправления" } };

                var receptionPoints = new List<SelectListItem>();
                try
                {
                    var geoId = CityGeoId;
                    if (!geoId.HasValue)
                        return new List<SelectListItem> { new SelectListItem { Text = "Не найден указанный город" } };
                    var apiService = new YandexDeliveryApiService(String.Empty, ApiToken, TestMode);
                    var points = apiService.GetPickPoints(new PickPointParams { AvailableForDropoff = true, GeoId = geoId.Value });
                    if (!(points?.Points?.Count > 0))
                        return new List<SelectListItem> { new SelectListItem { Text = "Не найдены точки самопривоза в указанном городе" } };
                    receptionPoints.Add(new SelectListItem { Text = "Не выбран", Value = "0" });
                    receptionPoints.AddRange(points.Points
                                                   .OrderBy(x => x.Address.FullAddress)
                                                   .Select(x =>
                                                        new SelectListItem
                                                        {
                                                            Text = x.Address.FullAddress, Value = x.Id,
                                                            Selected = x.Id == ReceptionPoint
                                                        }));
                }
                catch (Exception ex)
                {
                    Debug.Log.Error(ex);
                }

                return receptionPoints;
            }
        }

        public bool TestMode
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.TestMode).TryParseBool(); }
            set { Params.TryAddValue(YandexDeliveryTemplate.TestMode, value.ToString()); }
        }

        public override bool StatusesSync
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.StatusesSync).TryParseBool(); }
            set { Params.TryAddValue(YandexDeliveryTemplate.StatusesSync, value.ToString()); }
        }

        public override string StatusesReference
        {
            get { return Params.ElementOrDefault(YandexDeliveryTemplate.StatusesReference); }
            set { Params.TryAddValue(YandexDeliveryTemplate.StatusesReference, value.DefaultOrEmpty()); }
        }

        private Dictionary<string, string> _statuses;
        public override Dictionary<string, string> Statuses => _statuses ?? (_statuses = YandexDelivery.Statuses);

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (string.IsNullOrWhiteSpace(ApiToken))
                yield return new ValidationResult("Введите токен", new[] { "ApiToken" });
            if (ReceptionPoint == "0")
                yield return new ValidationResult("Не выбран пункт самопривоза", new[] { "ReceptionPoint" });
            if (PaymentCodCardId.IsNullOrEmpty() && PaymentCodCashId.IsNotEmpty())
                yield return new ValidationResult("Наложеннный платеж картой не указан", new[] { "PaymentCodCardId" });
            if (PaymentCodCashId.IsNullOrEmpty() && PaymentCodCardId.IsNotEmpty())
                yield return new ValidationResult("Наложеннный платеж наличными не указан", new[] { "PaymentCodCashId" });
            if (PaymentCodCardId.IsNotEmpty() && PaymentCodCardId == PaymentCodCashId)
                yield return new ValidationResult("Методы оплаты при получении должны быть различны");
        }
    }
}
