using System;
using AdvantShop.Core;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Customers;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Bonuses.ExternalBonus
{
    public class AddCardHandler : AbstractCommandHandler
    {
        private readonly Guid _customerId;
        private Customer _customer;

        public AddCardHandler(Guid customerId)
        {
            _customerId = customerId;
        }

        protected override void Load()
        {
            _customer = CustomerService.GetCustomer(_customerId);
        }

        protected override void Validate()
        {
            if (_customer is null)
                throw new BlException(T("Admin.Bonuses.ExternalBonus.AddCard.Error.UserNotFound"), "CustomerId");
            
            if (!BonusSystem.IsActive)
                throw new BlException(T("Admin.Bonuses.ExternalBonus.AddCard.Error.BonusSystemIsNotActive"));
            
            if (!BonusSystem.ImplementICardService)
                throw new BlException(T("Admin.Bonuses.ExternalBonus.AddCard.Error.BonusSystemCanNotCreateCard"));
        }

        protected override void Handle()
        {
            var card = BonusSystem.CreateCard(_customer);
            if (card is null)
                throw new BlException(T("Admin.Bonuses.ExternalBonus.AddCard.Error.IsNotCreateCard"));
        }
        
    }
}