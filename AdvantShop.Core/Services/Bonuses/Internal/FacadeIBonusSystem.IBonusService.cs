using AdvantShop.Customers;

namespace AdvantShop.Core.Services.Bonuses.Internal
{
    public partial class FacadeIBonusSystem : IBonusService
    {
        public bool Add(Customer customer, float bonuses, string basis = null)
        {
            var card = InternalBonusSystemService.GetCard(customer.Id);
            if (card is null)
                return false;
            
            InternalBonusSystemService.AcceptBonuses(
                card.CardId,
                amount: (decimal)bonuses,
                reason: basis,
                name: string.Empty,
                startDate: null,
                endDate: null,
                purchaseId: null,
                sendSms: false);
            
            return true;
        }

        public bool Remove(Customer customer, float bonuses, string basis = null)
        {
            var card = InternalBonusSystemService.GetCard(customer.Id);
            if (card is null)
                return false;

            var subtractBonuses =
                InternalBonusSystemService.SubtractBonuses(
                    card.CardId,
                    (decimal) bonuses,
                    basis);
            
            if (subtractBonuses == 0
                && bonuses != 0)
                return false;

            return true;
        }
    }
}