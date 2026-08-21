using System;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;

namespace AdvantShop.Models.MyAccount
{
    public sealed class CustomerContactDto
    {
        public string CustomerCompanyName { get; }

        public Guid ContactId { get; }

        public string Country { get; }

        public string City { get; }

        public string District { get; }

        public string Name { get; }

        public string FirstName { get; }

        public string LastName { get; }

        public string Patronymic { get; }

        public int CountryId { get; }

        public int? RegionId { get; }

        public string Region { get; }

        public string Zip { get; }

        public string Street { get; }

        public string House { get; }

        public string Apartment { get; }

        public string Structure { get; }

        public string Entrance { get; }

        public string Floor { get; }

        public bool IsMain { get; private set; }
        
        public bool IsShowFullAddress { get; }

        public string AggregatedAddress { get; }
        
        public CustomerContactDto(Customer customer, CustomerContact item)
        {
            CustomerCompanyName = customer.CustomerCompanyName;
            ContactId = item.ContactId;
            Country = item.Country;
            City = item.City;
            District = item.District;
            Name = item.Name;
            FirstName = customer.FirstName;
            LastName = customer.LastName;
            Patronymic = customer.Patronymic;
            CountryId = item.CountryId;
            RegionId = item.RegionId;
            Region = item.Region;
            Zip = item.Zip;

            Street = item.Street;
            House = item.House;
            Apartment = item.Apartment;
            Structure = item.Structure;
            Entrance = item.Entrance;
            Floor = item.Floor;
            IsMain = item.IsMain;

            IsShowFullAddress = SettingsCheckout.IsShowFullAddress;
            AggregatedAddress = new[]
            {
                SettingsCustomers.IsRegistrationAsLegalEntity
                    ? customer.CustomerCompanyName
                    : item.Name,
                item.Zip, item.Country, item.Region, item.City, item.District,
                !string.IsNullOrEmpty(item.Street)
                    ? LocalizationService.GetResource("Core.Orders.OrderContact.Street") + " " + item.Street
                    : "",
                !string.IsNullOrEmpty(item.House)
                    ? LocalizationService.GetResource("Admin.Js.CustomerView.House") + item.House
                    : "",
                !string.IsNullOrEmpty(item.Structure)
                    ? LocalizationService.GetResource("Admin.Js.CustomerView.Struct") + item.Structure
                    : "",
                !string.IsNullOrEmpty(item.Entrance)
                    ? LocalizationService.GetResource("Core.Orders.OrderContact.Entrance") + " " + item.Entrance
                    : "",
                !string.IsNullOrEmpty(item.Floor)
                    ? LocalizationService.GetResource("Admin.Customers.Customer.Floor").ToLower() + " " +
                      item.Floor
                    : "",
                !string.IsNullOrEmpty(item.Apartment)
                    ? LocalizationService.GetResource("Admin.Js.CustomerView.Ap") + item.Apartment
                    : ""
            }.Where(str => str.IsNotEmpty()).AggregateString(", ");
        }

        public void SetMain(bool isMain)
        {
            IsMain = isMain;
        }
    }
}