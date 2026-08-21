using AdvantShop.Areas.Api.Handlers.Customers;
using AdvantShop.Areas.Api.Models.Customers;
using AdvantShop.Core;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Bonuses.Internal.Model;
using AdvantShop.Customers;
using AdvantShop.Web.Infrastructure.Handlers;
using System;

namespace AdvantShop.Areas.Api.Handlers.Bonuses
{
    public class CreateBonusCard : AbstractCommandHandler<BonusCardResponse>
    {
        private readonly Guid _customerId;
        private Customer _customer;

        public CreateBonusCard(Guid customerId)
        {
            _customerId = customerId;
        }

        protected override void Validate()
        {
            _customer = CustomerService.GetCustomer(_customerId);
            if (_customer == null)
                throw new BlException("Покупатель не найден");

            if (InternalBonusSystemService.GetCard(_customer.Id) != null)
                throw new BlException("У покупателя уже есть бонусная карта");
        }

        protected override BonusCardResponse Handle()
        {
            var card = new Card { CardId = _customer.Id };

            InternalBonusSystemService.AddCard(card);

            return new GetCustomerBonuses(card.CardNumber).Execute();
        }
    }
}