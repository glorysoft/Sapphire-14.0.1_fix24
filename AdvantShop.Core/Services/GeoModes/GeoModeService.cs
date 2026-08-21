using System;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Core.Services.Domains;
using AdvantShop.Core.Services.GeoModes;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Orders;
using AdvantShop.Repository;
using AdvantShop.Shipping;

namespace AdvantShop.GeoModes
{
    public sealed class GeoModeService
    {
        public bool ShowGeoMode()
        {
            var isShowSelfDelivery = TemplateSettingsProvider.Items["ShowSelfDeliveryInDeliveryWidgetOnMain"].TryParseBool();
            var isShowPickPoint = TemplateSettingsProvider.Items["ShowDeliveryInDeliveryWidgetOnMain"].TryParseBool();

            return isShowSelfDelivery || isShowPickPoint;
        }

        public Guid? GetCurrentContactId()
        {
            return CommonHelper.GetCookie(GeoModeConfig.CurrentContactIdCookieName)?.Value?.TryParseGuid(true);
        }

        public CustomerContact GetCurrentContact()
        {
            var customer = CustomerContext.CurrentCustomer;
            
            if (customer == null || !customer.RegistredUser)
                return null;
            
            var currentContactId = GetCurrentContactId();

            return 
                currentContactId != null && currentContactId != Guid.Empty
                    ? customer.Contacts.Find(x => x.ContactId == currentContactId)
                    : null;
        }
        
        public void SetCurrentContactId(Guid? contactId)
        {
            if (contactId != null)
            {
                CommonHelper.SetCookie(
                    GeoModeConfig.CurrentContactIdCookieName, 
                    contactId.ToString(),
                    new TimeSpan(365, 0, 0, 0), 
                    false);
            }
            else
            {
                CommonHelper.DeleteCookie(GeoModeConfig.CurrentContactIdCookieName);
            }
        }

        public void SetCheckoutDataByCurrentZone()
        {
            var currentZone = IpZoneContext.CurrentZone;
            if (currentZone == null)
                return;
            
            var customer = CustomerContext.CurrentCustomer;
            var checkoutData = MyCheckout.Factory(customer.Id).Data;
            
            if (string.Equals(currentZone.CountryName, checkoutData.Contact?.Country)
                && string.Equals(currentZone.Region, checkoutData.Contact?.Region)
                && string.Equals(currentZone.District, checkoutData.Contact?.District)
                && string.Equals(currentZone.City, checkoutData.Contact?.City))
                return;
            
            var contact = customer.RegistredUser
                ? customer.Contacts.FirstOrDefault(x =>
                    string.Equals(x.Country, currentZone.CountryName, StringComparison.OrdinalIgnoreCase)
                    && string.Equals(x.Region, currentZone.Region, StringComparison.OrdinalIgnoreCase)
                    && string.Equals(x.City, currentZone.City, StringComparison.OrdinalIgnoreCase))
                : null;

            checkoutData.Contact =
                contact != null
                    ? CheckoutAddress.Create(contact)
                    : CheckoutAddress.Create(currentZone);

            if (customer.RegistredUser)
            {
                var mainContact = customer.Contacts.FirstOrDefault(x => x.IsMain);
                if (mainContact != null 
                    && contact != null 
                    && mainContact.ContactId != contact.ContactId)
                {
                    CustomerService.SetMainContact(true, customer.Id, contact.ContactId);
                }
            }
            
            checkoutData.PreSelectedShippingId = null;
            checkoutData.PreSelectedShippingPointId = null;
            checkoutData.SelectShipping = null;
            checkoutData.SelectPayment = null;
            
            OrderConfirmationService.Update(customer.Id, checkoutData);
        }

        public void SetIpZoneByCustomersCity(Customer customer)
        {
            if (!ShowGeoMode())
                return;
            
            if (customer == null || !customer.RegistredUser)
                return;

            var contact = customer.Contacts.FirstOrDefault(x => x.IsMain) 
                          ?? customer.Contacts.FirstOrDefault();
            
            if (contact == null)
                return;

            var city =
                contact.RegionId != null
                    ? CityService.GetCityByName(contact.City, contact.RegionId.Value)
                    : CityService.GetCityByName(contact.City);
            
            if (city == null)
                return;

            var zone = IpZoneService.GetZoneByCityId(city.CityId);
            if (zone == null)
                return;
            
            // если у города другой домен, то не меняем зону 
            var domainByCity = DomainGeoLocationService.GetDomain(zone.CityId);
            if (domainByCity != null)
                return;
            
            IpZoneContext.SetZone(zone);
            WarehouseService.SetCookie(null);

            var checkout = MyCheckout.Factory(customer.Id);
            var shippingType = GetShippingType(checkout.Data);

            if (shippingType == CalculationVariants.Courier)
                new SetCourierDeliveryGeoMode(customer, checkout).Execute();
            else
                new SetPickPointGeoMode(customer, checkout, true).Execute();
        }

        public CalculationVariants GetShippingType(CheckoutData checkoutData)
        {
            if (checkoutData?.TypeCalculationVariants != null)
                return checkoutData.TypeCalculationVariants == CalculationVariants.Courier
                    ? CalculationVariants.Courier
                    : CalculationVariants.PickPoint;
            
            var shippingTypeCookie = CommonHelper.GetCookieString(GeoModeConfig.ShippingTypeCookieName);

            return shippingTypeCookie.TryParseEnum(CalculationVariants.PickPoint);
        }
    }
}