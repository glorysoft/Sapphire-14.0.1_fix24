using System;
using AdvantShop.Areas.Api.Models.BonusLoyalty;
using AdvantShop.Core;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Customers;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.BonusLoyalty
{
    public class GetCustomerBonusCard : AbstractCommandHandler<BonusCardResponse>
    {
        private readonly Guid _id;
        private readonly string _cardNumber;
        private readonly bool _loadCustomer;
        private Card _bonusCard;
        private Customer _customer;
        
        public GetCustomerBonusCard(Guid id)
        {
            _id = id;
            _loadCustomer = true;
        }
        
        public GetCustomerBonusCard(Guid id, bool loadCustomer)
        {
            _id = id;
            _loadCustomer = loadCustomer;
        }

        public GetCustomerBonusCard(string cardNumber)
        {
            _cardNumber = cardNumber;
        }
    
        protected override void Validate()
        {
            if (!BonusSystem.ImplementICardService)
                throw new BlException("Бонусная система не поддерживает работу с бонусными картами");

            if (!string.IsNullOrWhiteSpace(_cardNumber))
            {
                _bonusCard = BonusSystem.GetCardByNumber(_cardNumber);
                if (_bonusCard == null)
                    throw new BlException("Бонусная карта не найдена");
            }
            else
            {
                _customer = CustomerService.GetCustomer(_id);
                if (_customer == null)
                    throw new BlException("Пользователь не найден");

                _bonusCard = BonusSystem.GetCard(_customer);
                if (_bonusCard == null)
                    throw new BlException("Бонусная карта не найдена");
            }
        }

        protected override BonusCardResponse Handle()
        {
            return new BonusCardResponse(_bonusCard, _loadCustomer ? _customer : null);
        }
    }
}