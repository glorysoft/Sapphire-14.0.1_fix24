using System;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Customers;
using AdvantShop.GeoModes;
using AdvantShop.Handlers.Location;
using AdvantShop.Helpers;
using AdvantShop.Models.Location;
using AdvantShop.Orders;
using AdvantShop.Repository;
using AdvantShop.Shipping;

namespace AdvantShop.Handlers.Home
{
    public sealed class GetGeoMode
    {
        private readonly GeoModeService _geoModeService;
        private readonly Customer _customer;
        private readonly CheckoutData _checkoutData;
        
        private static readonly int EmptyCheckoutAddressHash = new CheckoutAddress().GetHashCode();

        public GetGeoMode(GeoModeService geoModeService)
        {
            _geoModeService = geoModeService;
            
            _customer = CustomerContext.CurrentCustomer;
            _checkoutData = OrderConfirmationService.Get(_customer.Id)  // можно получить напрямую тк нет сохранения
                            ?? new CheckoutData();
        }
        
        public GeoModeModel Execute()
        {
            var isShowSelfDelivery = TemplateSettingsProvider.Items["ShowSelfDeliveryInDeliveryWidgetOnMain"].TryParseBool();
            var isShowCourier = TemplateSettingsProvider.Items["ShowDeliveryInDeliveryWidgetOnMain"].TryParseBool();
            var isShowCityFilterInSelfDelivery = TemplateSettingsProvider.Items["ShowCityFilterInSelfDelivery"].TryParseBool();
            
             // Данные MyCheckout имеют приоритет и влияют на GeoMode
            
            // #region Contact
            var currentContactIdByGeoMode = _geoModeService.GetCurrentContactId();
            var currentContact = GetCurrentContact(currentContactIdByGeoMode);
            var courierAddress = GetCourierAddress(currentContact, currentContactIdByGeoMode);
            // #endregion Contact end

            // #region shippingType
            var shippingTypeVariant = _geoModeService.GetShippingType(_checkoutData);
       
            var shippingType = shippingTypeVariant == CalculationVariants.PickPoint
                ? isShowSelfDelivery ? GeoModeConfig.PickPointType : GeoModeConfig.CourierType
                : isShowCourier ? GeoModeConfig.CourierType : GeoModeConfig.PickPointType;
            // #endregion shippingType end

            // #region currentCity
            var country = 
                _checkoutData.Contact.Country.IsNotEmpty() 
                    ? CountryService.GetCountryByName(_checkoutData.Contact.Country)
                    : null;
            var region =
                _checkoutData.Contact.Region.IsNotEmpty()
                    ? country is null
                        ? RegionService.GetRegionByName(_checkoutData.Contact.Region)
                        : RegionService.GetRegion(_checkoutData.Contact.Region, country.CountryId)
                    : null;
            var currentCity =
                _checkoutData.Contact.City.IsNotEmpty()
                    ? region is null
                        ? CityService.GetCityByName(_checkoutData.Contact.City)
                        : CityService.GetCityByName(_checkoutData.Contact.City, region.RegionId)
                    : null;
            currentCity = currentCity ?? GetCurrentCityHandler.Execute();
            // #endregion currentCity end
  
            // #region isPointSelected
            var isPointSelected =
                CommonHelper.GetCookie(GeoModeConfig.PointCookieName) != null 
                || CommonHelper.GetCookie(GeoModeConfig.PreviousShippingIdCookieName) != null
                || _checkoutData.SelectShipping?.SelectedPoint != null;
            // #endregion isPointSelected end
            
            // #region selectedOption
            BaseShippingOption selectedOption = null;
            if (shippingType == GeoModeConfig.PickPointType && _checkoutData.SelectShipping?.TypeOfDelivery == EnTypeOfDelivery.SelfDelivery 
                || shippingType == GeoModeConfig.CourierType && _checkoutData.SelectShipping?.TypeOfDelivery == EnTypeOfDelivery.Courier)
            {
                selectedOption = _checkoutData.SelectShipping;
            }
            // #endregion selectedOption end
    
            var model = new GeoModeModel
            {
                IsPointSelected = isPointSelected,
                CurrentContact = currentContact,
                CourierAddress = courierAddress,
                HasContacts = _customer.RegistredUser && _customer.Contacts.Any(),
                IsUserRegistered = _customer.RegistredUser,
                ShippingType = shippingType,
                ShowSelfDelivery = isShowSelfDelivery,
                ShowCourier = isShowCourier,
                CurrentCity = currentCity,
                IsShowCityFilterInSelfDelivery = isShowCityFilterInSelfDelivery,
                IsShowMapPickup = SettingsDesign.UseMapForPickupPoints.HasValue && SettingsDesign.UseMapForPickupPoints.Value,
                ShowMapAddress = 
                    SettingsDesign.AllowUseYandexMap 
                    && SettingsDesign.UseYandexMap 
                    && SettingsPersonalAccount.ShowMapAddress 
                    && SettingsDesign.YandexMapApiKey.IsNotEmpty(),
                SelectedOption = selectedOption,
            };
            
            CommonHelper.SetCookie(GeoModeConfig.ShippingTypeCookieName, shippingType);

            return model;
        }

        private CustomerContact GetCurrentContact(Guid? contactIdByGeoMode)
        {
            CustomerContact currentContact = null;
                
            if (_customer.RegistredUser
                && _checkoutData.Contact.GetHashCode() != EmptyCheckoutAddressHash)
            {
                currentContact = 
                    _customer.Contacts.Find(x => x.ContactId == _checkoutData.Contact.ContactId)
                    ?? GetContactByCheckoutData();
            }
            else
            {
                if (_customer.RegistredUser)
                    currentContact = contactIdByGeoMode != null && contactIdByGeoMode != Guid.Empty
                        ? _customer.Contacts.Find(x => x.ContactId == contactIdByGeoMode)
                        : null;

                if (currentContact is null && _checkoutData.Contact.GetHashCode() != EmptyCheckoutAddressHash)
                    currentContact = GetContactByCheckoutData();
            }

            return currentContact;
        }
        
        private CustomerContact GetCourierAddress(CustomerContact currentContact, Guid? contactIdByGeoMode) =>
            (_checkoutData.Contact.ContactId ?? Guid.Empty) != Guid.Empty
                ? currentContact
                : _customer.RegistredUser && _customer.Contacts.Count != 0
                    ? _customer.Contacts.Find(x => x.ContactId == contactIdByGeoMode)
                    : null;

        private CustomerContact GetContactByCheckoutData()
        {
            var countryId = _checkoutData.Contact.Country.IsNotEmpty()
                ? CountryService.GetCountryIdByName(_checkoutData.Contact.Country)
                : 0;
            
            return new CustomerContact
            {
                Name = StringHelper.AggregateStrings(" ", 
                        _customer.LastName, _customer.FirstName, _customer.Patronymic),
                Country = _checkoutData.Contact.Country,
                CountryId =  countryId,
                Region = _checkoutData.Contact.Region,
                City = _checkoutData.Contact.City,
                District = _checkoutData.Contact.District,
                Zip = _checkoutData.Contact.Zip,

                Street = _checkoutData.Contact.Street,
                House = _checkoutData.Contact.House,
                Apartment = _checkoutData.Contact.Apartment,
                Structure = _checkoutData.Contact.Structure,
                Entrance = _checkoutData.Contact.Entrance,
                Floor = _checkoutData.Contact.Floor
            };
        }
    }
}