using System;
using System.Linq;
using System.Web;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Customers;
using AdvantShop.GeoModes;
using AdvantShop.Helpers;
using AdvantShop.Orders;
using AdvantShop.Repository;
using AdvantShop.Shipping;
using AdvantShop.ViewModel.Checkout;
using AdvantShop.Web.Infrastructure.Handlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AdvantShop.Handlers.Checkout.GeoMode
{
    public sealed class GetGeoModeDeliveries : AbstractCommandHandler<GeoModeDeliveriesResponse>
    {
        private readonly CalculationVariants? _typeCalculationVariants;

        public GetGeoModeDeliveries(CalculationVariants? typeCalculationVariants)
        {
            _typeCalculationVariants = typeCalculationVariants;
        }
        
        protected override GeoModeDeliveriesResponse Handle()
        {
            /*
             * !!! Данные MyCheckout имеют приоритет и влияют на GeoMode
             */
            var checkout = MyCheckout.Factory(CustomerContext.CustomerId);

            var isChangedTypeCalc = _typeCalculationVariants.HasValue
                                    && checkout.Data.TypeCalculationVariants != _typeCalculationVariants;
            checkout.Data.TypeCalculationVariants = _typeCalculationVariants;

            /*
             * Если не меняется тип доставки, то вернем актуальное из данных текущего оформления заказа.
             * Если тип меняется на самовывоз, то подтягиваем из печенек, ранее выбранное.
             */
            
            if (isChangedTypeCalc
                && _typeCalculationVariants == CalculationVariants.PickPoint)
            {
                var geoModeSelectedShipping = HttpUtility.UrlDecode(CommonHelper.GetCookieString(GeoModeConfig.PointCookieName));
                if (geoModeSelectedShipping.IsNotEmpty())
                {
                    try
                    {
                        var deserializeObject = JsonConvert.DeserializeObject(geoModeSelectedShipping);
                        if (deserializeObject is JObject jObject)
                        {
                            checkout.Data.PreSelectedShippingId = jObject?["shippingOptionId"]?.ToString();
                            checkout.Data.PreSelectedShippingPointId = jObject?["pointId"]?.ToString();
                        }
                    }
                    catch (Exception ex)
                    {
                        checkout.Data.PreSelectedShippingId = geoModeSelectedShipping;
                    }
                }
                else
                {
                    var previousSelectedShippingId = CommonHelper.GetCookieString(GeoModeConfig.PreviousShippingIdCookieName);
                    if (previousSelectedShippingId.IsNotEmpty())
                    {
                        checkout.Data.PreSelectedShippingId = HttpUtility.UrlDecode(previousSelectedShippingId);
                    
                        var pointId = CommonHelper.GetCookieString(GeoModeConfig.PreviousShippingPointIdCookieName);
                        if (pointId.IsNotEmpty())
                            checkout.Data.PreSelectedShippingPointId = HttpUtility.UrlDecode(pointId);  
                    
                        CommonHelper.DeleteCookie(GeoModeConfig.PreviousShippingIdCookieName);
                        CommonHelper.DeleteCookie(GeoModeConfig.PreviousShippingPointIdCookieName);
                    }
                }
                
                // От Азата: самовывоз должен игнорировать ардесную книгу (в чекауте пока забиваем, потом будем разрешать)
                var currentZone = IpZoneContext.CurrentZone;
                var customer = CustomerContext.CurrentCustomer;
                CustomerContact contact = null;
                if (customer.RegistredUser 
                    && customer.Contacts.Count > 0
                    && currentZone != null)
                {
                    contact = customer.Contacts.FirstOrDefault(x =>
                        string.Equals(x.Country, currentZone.CountryName, StringComparison.OrdinalIgnoreCase)
                        && string.Equals(x.Region, currentZone.Region, StringComparison.OrdinalIgnoreCase)
                        && string.Equals(x.City, currentZone.City, StringComparison.OrdinalIgnoreCase));
                }

                if (contact != null) 
                    checkout.Data.Contact = CheckoutAddress.Create(contact);
                else if (currentZone != null)
                    checkout.Data.Contact = new CheckoutAddress()
                    {
                        Country = currentZone.CountryName,
                        Region = currentZone.Region,
                        City = currentZone.City,
                        District = currentZone.District,
                        Zip = currentZone.Zip
                    };
            }
            
            if (isChangedTypeCalc)
                checkout.Update();

            var result = 
                new GetCheckoutShippings(_typeCalculationVariants, usePassedTypeCalculationVariants: true)
                    .Execute();

            var reloadPage = WarehouseService.TryUpdateWarehouseCookieByShipping(result.selectShipping);
            
            return new GeoModeDeliveriesResponse()
            {
                Options = result.option,
                SelectedOption = result.selectShipping,
                ReloadPage = reloadPage
            };
        }
    }
}