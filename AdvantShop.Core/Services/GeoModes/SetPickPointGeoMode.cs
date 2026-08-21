using System;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Customers;
using AdvantShop.GeoModes;
using AdvantShop.Helpers;
using AdvantShop.Orders;
using AdvantShop.Repository;
using AdvantShop.Shipping;
using Newtonsoft.Json;

namespace AdvantShop.Core.Services.GeoModes
{
    public sealed class SetPickPointGeoMode
    {
        private readonly MyCheckout _checkout;
        private readonly bool _preSelectPreviousShipping;
        private readonly Customer _customer;
        private int? _shippingMethodId;
        private string _pointId;
        
        public SetPickPointGeoMode(int shippingMethodId, string pointId)
        {
            _shippingMethodId = shippingMethodId;
            _pointId = pointId;
            
            _customer = CustomerContext.CurrentCustomer;
            _checkout = MyCheckout.Factory(_customer.Id);
        }
        
        public SetPickPointGeoMode(Customer customer, MyCheckout checkout, bool preSelectPreviousShipping)
        {
            _checkout = checkout;
            _customer = customer;
            _preSelectPreviousShipping = preSelectPreviousShipping;
        }

        public SetGeoModePointDto Execute()
        {
            var currentZone = IpZoneContext.CurrentZone;

            if (currentZone != null)
            {
                var contact = _customer.RegistredUser
                    ? _customer.Contacts.FirstOrDefault(x =>
                        string.Equals(x.Country, currentZone.CountryName, StringComparison.OrdinalIgnoreCase)
                        && string.Equals(x.Region, currentZone.Region, StringComparison.OrdinalIgnoreCase)
                        && string.Equals(x.City, currentZone.City, StringComparison.OrdinalIgnoreCase))
                    : null;

                _checkout.Data.Contact =
                    contact != null
                        ? CheckoutAddress.Create(contact)
                        : new CheckoutAddress()
                        {
                            Country = currentZone.CountryName,
                            Region = currentZone.Region,
                            City = currentZone.City,
                            District = currentZone.District,
                            Zip = currentZone.Zip
                        };

                if (_customer.RegistredUser)
                {
                    var mainContact = _customer.Contacts.FirstOrDefault(x => x.IsMain);
                    if (mainContact != null 
                        && contact != null 
                        && mainContact.ContactId != contact.ContactId)
                    {
                        CustomerService.SetMainContact(true, _customer.Id, contact.ContactId);
                    }
                }
            }

            if (_preSelectPreviousShipping
                && _checkout.Data.SelectShipping != null
                && _checkout.Data.SelectShipping.MethodId != 0)
            {
                _shippingMethodId = _checkout.Data.SelectShipping.MethodId;
                _pointId = _checkout.Data.SelectShipping.SelectedPoint?.Id;
            }
            
            _checkout.Data.TypeCalculationVariants = CalculationVariants.PickPoint;

            // var result = 
            //     new GetCheckoutShippings(CalculationVariants.PickPoint, usePassedTypeCalculationVariants: true)
            //         .Execute();
            
            var options = _checkout.AvailableShippingOptions(null, CalculationVariants.PickPoint);
            BaseShippingOption selectedOption = null;
            
            if (_shippingMethodId != null)
            {
                selectedOption =
                    options.FirstOrDefault(x => x.Id == _shippingMethodId.ToString()) ??
                    options.FirstOrDefault(x => x.Id.StartsWith(_shippingMethodId + "_"));

                if (selectedOption != null)
                {
                    _checkout.Data.SelectShipping = selectedOption;

                    if (_pointId.IsNotEmpty() && selectedOption is ISelectShippingPoint pointOption)
                        pointOption.SelectShippingPoint(_pointId);
                }

                _checkout.Data.PreSelectedShippingId = null;
                _checkout.Data.PreSelectedShippingPointId = null;
            }

            if (selectedOption == null)
            {
                selectedOption = options.FirstOrDefault(x => x.TypeOfDelivery == EnTypeOfDelivery.SelfDelivery);
                if (selectedOption != null)
                    _checkout.Data.SelectShipping = selectedOption;
            }
            
            _checkout.Update(_customer.Id);
            
            CommonHelper.SetCookie(GeoModeConfig.ShippingTypeCookieName, GeoModeConfig.PickPointType);
            
            var reloadPage = WarehouseService.TryUpdateWarehouseCookieByShipping(selectedOption);

            return new SetGeoModePointDto()
            {
                SelectedOption = selectedOption,
                ReloadPage = reloadPage
            };
        }
    }
    
    public sealed class SetGeoModePointDto
    {
        [JsonProperty("selectedOption")]
        public BaseShippingOption SelectedOption { get; set; }

        [JsonProperty("reloadPage")]
        public bool ReloadPage { get; set; }
    }
}