using System;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Customers;

namespace AdvantShop.Core.Services.Bonuses.Internal
{
    public partial class FacadeIBonusSystem : ICardService
    {
        public Card Get(Customer customer)
        {
            var card = InternalBonusSystemService.GetCard(customer.Id);
            return card != null ? ConvertCard(card) : null;
        }

        public Card Get(string number)
        {
            if (number.IsNullOrEmpty())
                return null;
            
            if (long.TryParse(number, out long numberAsLong))
                InternalBonusSystemService.GetCard(numberAsLong);
            
            if (Guid.TryParse(number, out Guid numberAsGuid))
                InternalBonusSystemService.GetCard(numberAsGuid);

            return null;
        }

        public Card Create(Customer customer)
        {
            var card = InternalBonusSystemService.GetCard(customer.Id);
            if (card != null)
                return ConvertCard(card);
            
            var cardnumber = InternalBonusSystemService.AddCard(new Model.Card {CardId = customer.Id});
            return ConvertCard(InternalBonusSystemService.GetCard(cardnumber));
        }

        public bool Delete(Customer customer)
        {
            Service.CardService.Delete(customer.Id);
            return true;
        }

        private static Card ConvertCard(Model.Card card)
            => new Card(card.CardNumber.ToString())
            {
                Bonuses = card.Blocked ? null : (float?) card.BonusesTotalAmount
            };

    }
}