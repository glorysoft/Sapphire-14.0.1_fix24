using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Customers;
using AdvantShop.Orders;
using AdvantShop.ViewModel.Checkout;

namespace AdvantShop.Handlers.Checkout
{
    public class CheckoutBonusHandler
    {
        public CheckoutBonusViewModel Execute()
        {
            if (!BonusSystem.IsActive)
                return null;

            var current = MyCheckout.Factory(CustomerContext.CustomerId);
            var bonusCard = BonusSystem.GetCard(CustomerContext.CurrentCustomer);

            var appliedBonuses = bonusCard?.Bonuses?.SimpleRoundPrice() ?? 0;

            if (current.Data.SelectShipping != null || current.AvailableShippingOptions().Count == 0)
                appliedBonuses = BonusSystem.GetApplyBonuses(current.Cart, current.Data.SelectShipping?.FinalRate ?? 0, current.Data.SelectPayment?.Rate ?? 0, current.Data.Bonus.AppliedBonuses);

            if (appliedBonuses != current.Data.Bonus.AppliedBonuses)
                current.Data.Bonus.AppliedBonuses = appliedBonuses;

            current.Update();
            return new CheckoutBonusViewModel()
            {
                AppliedBonuses = appliedBonuses,
                HasCard = bonusCard != null,
                CreateCardAvailable = BonusSystem.ImplementICardService,
                BonusPlus = BonusSystem.GetAccrueBonuses(current.Cart, current.Data.SelectShipping?.FinalRate ?? 0, current.Data.SelectPayment?.Rate ?? 0, usedBonuses: null),
                AllowSpecifyBonusAmount = BonusSystem.IsInternal && InternalBonusSystem.AllowSpecifyBonusAmount,
                ProhibitAccrualAndSubstractBonuses = BonusSystem.IsInternal && InternalBonusSystem.ProhibitAccrualAndSubstractBonuses
            };
        }
    }
}