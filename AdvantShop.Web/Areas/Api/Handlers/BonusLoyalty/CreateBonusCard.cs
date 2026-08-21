using System;
using AdvantShop.Areas.Api.Models.BonusLoyalty;
using AdvantShop.Core;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Customers;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.BonusLoyalty
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
            if (!BonusSystem.ImplementICardService)
                throw new BlException("Бонусная система не поддерживает работу с бонусными картами");

            _customer = CustomerService.GetCustomer(_customerId);
            if (_customer == null)
                throw new BlException("Покупатель не найден");

            if (BonusSystem.GetCard(_customer) != null)
                throw new BlException("У покупателя уже есть бонусная карта");
        }
    
        protected override BonusCardResponse Handle()
        {
            var card = BonusSystem.CreateCard(_customer);
            
            if (card is null)
                throw new BlException("Не удалось создать бонусную карту");

            return new BonusCardResponse(card);
        }
    }
}