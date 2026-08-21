using System;
using AdvantShop.Areas.Api.Models.BonusLoyalty;
using AdvantShop.Core;
using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Customers;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.BonusLoyalty
{
    public class SubstractBonuses : AbstractCommandHandler<ApiResponse>
    {
        private readonly Guid _customerId;
        private readonly SubstractBonusModel _model;
        private Customer _customer;

        public SubstractBonuses(Guid customerId, SubstractBonusModel model)
        {
            _customerId = customerId;
            _model = model;
        }

        protected override void Validate()
        {
            if (!BonusSystem.ImplementIBonusService)
                throw new BlException("Бонусная система не поддерживает начисление и списание бонусов");

            _customer = CustomerService.GetCustomer(_customerId);
            if (_customer == null)
                throw new BlException("Покупатель не найден");

            if (_model.Amount < 0)
                throw new BlException("Не может быть отрицательным");
        }

        protected override ApiResponse Handle()
        {
            return BonusSystem.RemoveBonuses(_customer, (float)_model.Amount, _model.Reason)
                ? new ApiResponse()
                : new ApiError("Не удалось списать бонусы");
        }
    }
}