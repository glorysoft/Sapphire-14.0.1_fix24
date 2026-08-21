using System;
using System.Linq;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Customers;
using AdvantShop.GeoModes;
using AdvantShop.Helpers;
using AdvantShop.Orders;
using AdvantShop.Shipping;
using Newtonsoft.Json;

namespace AdvantShop.Core.Services.GeoModes
{
    public sealed class SetCourierDeliveryGeoMode
    {
        private readonly Guid? _contactId;
        private readonly Customer _customer;
        private readonly MyCheckout _checkout;

        public SetCourierDeliveryGeoMode(Guid contactId)
        {
            _contactId = contactId;
            
            _customer = CustomerContext.CurrentCustomer;
            _checkout = MyCheckout.Factory(_customer.Id);
        }
        
        public SetCourierDeliveryGeoMode(Customer customer, MyCheckout checkout)
        {
            _customer = customer;
            _checkout = checkout;
        }

        public SetCourierDeliveryGeoModeDto Execute()
        {
            if (_customer.RegistredUser)
            {
                CustomerContact contact;
                
                if (_contactId != null)
                {
                    contact = _customer.Contacts.Find(x => x.ContactId == _contactId);
                    if (contact != null && !contact.IsMain)
                    {
                        CustomerService.SetMainContact(true, _customer.Id, contact.ContactId);

                        _customer.Contacts = CustomerService.GetCustomerContacts(_customer.Id);

                        new GeoModeService().SetCurrentContactId(contact.ContactId);
                    }
                }

                contact = _customer.Contacts.FirstOrDefault(x => x.IsMain)
                          ?? _customer.Contacts.FirstOrDefault();
                
                if (contact != null)
                    _checkout.Data.Contact = CheckoutAddress.Create(contact);
            }

            var options = _checkout.AvailableShippingOptions(null, CalculationVariants.Courier);
            var selectedOption = options.FirstOrDefault(x => x.TypeOfDelivery == EnTypeOfDelivery.Courier);
            if (selectedOption != null)
                _checkout.Data.SelectShipping = selectedOption;
            
            _checkout.Data.TypeCalculationVariants = CalculationVariants.Courier;
            
            _checkout.Update(_customer.Id);
            
            CommonHelper.SetCookie(GeoModeConfig.ShippingTypeCookieName, GeoModeConfig.CourierType);
            
            var reloadPage = WarehouseService.TryUpdateWarehouseCookieByShipping(selectedOption);
            
            return new SetCourierDeliveryGeoModeDto
            {
                SelectedOption = selectedOption,
                ReloadPage = reloadPage
            };
        }
    }
    
    public sealed class SetCourierDeliveryGeoModeDto
    {
        [JsonProperty("selectedOption")]
        public BaseShippingOption SelectedOption { get; set; }
        
        [JsonProperty("reloadPage")]
        public bool ReloadPage { get; set; }
    }
}