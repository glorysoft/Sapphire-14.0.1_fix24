using AdvantShop.Customers;
using AdvantShop.Repository;
using AdvantShop.Shipping;

namespace AdvantShop.Models.Location
{
    public sealed class GeoModeModel
    {
        public CustomerContact CurrentContact { get; set; }
        public CustomerContact CourierAddress { get; set; }
        public string ShippingType { get; set; }
        public bool IsUserRegistered { get; set; }
        public bool IsPointSelected { get; set; }
        public bool ShowSelfDelivery { get; set; }
        public bool ShowCourier { get; set; }
        public bool ShowMapAddress { get; set; }
        public bool HasContacts { get; set; }
        public City CurrentCity { get; set; }
        public bool IsShowCityFilterInSelfDelivery { get; set; }
        public bool IsShowMapPickup { get; set; }
        public BaseShippingOption SelectedOption { get; set; }
    }
}