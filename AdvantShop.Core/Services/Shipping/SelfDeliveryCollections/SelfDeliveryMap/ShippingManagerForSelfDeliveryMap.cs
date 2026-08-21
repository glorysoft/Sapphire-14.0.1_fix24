using System;
using AdvantShop.Core.Common;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap
{
    public class ShippingManagerForSelfDeliveryMap : ShippingManager
    {
        public ShippingManagerForSelfDeliveryMap(Func<IConfiguratorShippingCalculation, ShippingCalculationParameters> shippingCalculationConfiguration) 
            : base(shippingCalculationConfiguration)
        {
        }

        public ShippingManagerForSelfDeliveryMap(ShippingCalculationParameters calculationParameters) : base(calculationParameters)
        {
        }

        protected override bool CheckShippingOnGeoFilter(ShippingMethod shippingMethod)
        {
            return true;
            // return IgnoreGeoFilter || base.CheckShippingOnGeoFilter(shippingMethod);
        }
    }
}