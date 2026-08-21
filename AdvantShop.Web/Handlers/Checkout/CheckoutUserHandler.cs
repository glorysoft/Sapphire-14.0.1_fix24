using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Customers;
using AdvantShop.Orders;
using AdvantShop.ViewModel.Checkout;
using AdvantShop.Repository.Currencies;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Auth;

namespace AdvantShop.Handlers.Checkout
{
    public class CheckoutUserHandler
    {
        private readonly bool? _isLanding;
        private readonly bool? _isApi;

        public CheckoutUserHandler(bool? isLanding, bool? isApi)
        {
            _isLanding = isLanding;
            _isApi = isApi;
        }

        public CheckoutUserViewModel Execute()
        {
            var current = MyCheckout.Factory(CustomerContext.CustomerId);

            var model = new CheckoutUserViewModel()
            {
                Customer = CustomerContext.CurrentCustomer,
                Data = current.Data,
                Currency = CurrencyService.CurrentCurrency,
                IsLanding = _isLanding != null && _isLanding.Value,
                IsApi = _isApi != null && _isApi.Value,
                IsLegalCustomer = SettingsCustomers.IsRegistrationAsLegalEntity,
                IsPhysicalCustomer = SettingsCustomers.IsRegistrationAsPhysicalEntity,
                AuthMethod = SettingsAuth.AuthMethod == 
                    EAuthMethod.Code && !SettingsAuth.AuthByCodeActive
                        ? EAuthMethod.Email
                        : SettingsAuth.AuthMethod,
            };

            if (BonusSystem.IsActive
                && BonusSystem.ImplementICardService)
            {
                model.IsBonusSystemActive = true;
                model.BonusPlus = BonusSystem.IsInternal && InternalBonusSystem.BonusesForNewCard != 0
                    ? InternalBonusSystem.BonusesForNewCard
                    : BonusSystem.GetAccrueBonuses(current.Cart, current.Data.SelectShipping?.FinalRate ?? 0, current.Data.SelectPayment?.Rate ?? 0, usedBonuses: null);
            }

            return model;
        }

    }
}