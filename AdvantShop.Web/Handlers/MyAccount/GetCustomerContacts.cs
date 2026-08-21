using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Customers;
using AdvantShop.GeoModes;
using AdvantShop.Models.MyAccount;
using AdvantShop.Repository;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.MyAccount
{
    internal sealed class GetCustomerContacts : ICommandHandler<List<CustomerContactDto>>
    {
        private readonly bool? _isGeoMode;

        public GetCustomerContacts(bool? isGeoMode)
        {
            _isGeoMode = isGeoMode;
        }

        public List<CustomerContactDto> Execute()
        {
            var customer = CustomerContext.CurrentCustomer;

            var contacts = customer.Contacts.Select(x => new CustomerContactDto(customer, x)).ToList();

            if (_isGeoMode != null && _isGeoMode.Value)
            {
                var geoModeService = new GeoModeService();
                if (geoModeService.ShowGeoMode() && geoModeService.GetCurrentContactId() == null)
                {
                    contacts.ForEach(x => x.SetMain(false));

                    var city = IpZoneContext.CurrentZone?.City;

                    if (city.IsNotEmpty())
                        contacts = 
                            contacts.OrderByDescending(x => x.City != null && x.City.Equals(city, StringComparison.OrdinalIgnoreCase)).ToList();
                }
            }
            
            return contacts;
        }
    }
}