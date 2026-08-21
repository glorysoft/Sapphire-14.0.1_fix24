using AdvantShop.Core.Common.Extensions;
using AdvantShop.Customers;
using AdvantShop.Orders;

namespace AdvantShop.Core.Services.Bonuses.Internal
{
    public static class OrderExtensionsForInternalBonusSystem
    {
        public static Model.Card GetOrderInternalBonusCard(this Order order)
        {
            if (!BonusSystem.IsInternal
                || !BonusSystem.IsActive)
                return null;
            
            Model.Card bonusCard = null;
            // лучше поменять логику как в OrderExtensions.GetOrderBonusCard:
            // вначале искать по покупателю
            if (order.BonusCardNumber.IsNotEmpty()
                && order.BonusSystemOfCard == BonusSystem.CurrentBonusSystemKey
                && BonusSystem.IsInternal
                && long.TryParse(order.BonusCardNumber, out long longCardNumber))
                bonusCard = InternalBonusSystemService.GetCard(longCardNumber);

            if (bonusCard == null && order.OrderCustomer != null)
            {
                var customer = CustomerService.GetCustomer(order.OrderCustomer.CustomerID);
                if (customer != null)
                    bonusCard = InternalBonusSystemService.GetCard(customer.Id);
            }

            return bonusCard;
        }
    }
}