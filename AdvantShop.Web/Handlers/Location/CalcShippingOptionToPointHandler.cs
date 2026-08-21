using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap;
using AdvantShop.Repository.Currencies;
using AdvantShop.Shipping;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.Location
{
    public class CalcShippingOptionToPointHandler: ICommandHandler<BaseShippingOption>
    {
        private readonly int? _shippingMethodId;
        private readonly string _pointId;

        public CalcShippingOptionToPointHandler(int? shippingMethodId, string pointId)
        {
            _shippingMethodId = shippingMethodId;
            _pointId = pointId;
        }

        public BaseShippingOption Execute()
        {
            var shippingManager = new ShippingManagerForSelfDeliveryMap(
                config =>
                {
                    var configuratorShippingCalculation =
                        config
                           .WithPreOrderItems(new List<PreOrderItem>())
                           .WithCurrency(CurrencyService.CurrentCurrency);
                    if (_shippingMethodId.HasValue)
                    {
                        var shippingMethod = ShippingMethodService.GetShippingMethod(_shippingMethodId.Value);
                        if (shippingMethod != null)
                            configuratorShippingCalculation.WithShippingOption(
                                new BaseShippingOption(shippingMethod, 0));
                    }
                    return configuratorShippingCalculation.Build();
                });
            shippingManager.PreferShippingOptionFromParameters();
            return shippingManager.GetOptionsToPoint(_pointId)
                                  .OrderBy(x => x.FinalRate)
                                  .FirstOrDefault();
        }
    }
}