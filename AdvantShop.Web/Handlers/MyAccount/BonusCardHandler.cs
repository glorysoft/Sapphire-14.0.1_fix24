using System;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Customers;
using AdvantShop.ViewModel.MyAccount;
using Card = AdvantShop.Core.Services.Bonuses.Internal.Model.Card;

namespace AdvantShop.Handlers.MyAccount
{
    public class MyAccountBonusSystemHandler
    {
        private readonly Customer _customer;

        public MyAccountBonusSystemHandler(Customer customer)
        {
            _customer = customer;
        }

        public MyAccountBonusCardViewModel Get()
        {
            if (!BonusSystem.IsInternal) 
                return new MyAccountBonusCardViewModel();

            Card bonusCard;
            MyAccountBonusCardViewModel model;

            if ((bonusCard = InternalBonusSystemService.GetCard(_customer.Id)) != null)
            {
                model = new MyAccountBonusCardViewModel()
                {
                    BonusCard = bonusCard,
                    //BonusFirstName = bonusCard.FirstName,
                    //BonusLastName = bonusCard.LastName,
                    //BonusSecondName = bonusCard.SecondName,
                    //BonusDate = bonusCard.DateOfBirth != null ? ((DateTime)bonusCard.DateOfBirth).ToString("dd.MM.yyyy") : string.Empty,
                    //BonusPhone = bonusCard.CellPhone,
                    //BonusGender = bonusCard.Gender
                };
            }
            else
            {
                model = new MyAccountBonusCardViewModel()
                {
                    //BonusFirstName = _customer.FirstName,
                    //BonusLastName = _customer.LastName,
                    //BonusSecondName = _customer.Patronymic,
                    BonusPlus = InternalBonusSystem.BonusesForNewCard
                };
            }

            return model;
        }
    }
}