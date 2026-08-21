using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Models.User;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class InitRegistrationHandler : ICommandHandler<InitRegistrationModel>
    {
        private bool _isBonusSystemActive;
        private string _bonusesForNewCard;

        private bool _isDemo;
        private string _email;
        private string _firstName;
        private string _lastName;
        private string _phone;

        private readonly List<SelectListItem> _customerTypes = new List<SelectListItem>();
        
        private string _customerTypeByDefault;

        private RegistrationSettingsModel _settings;
        private RegistrationModel _model;
        
        public InitRegistrationModel Execute()
        {
            Load();
            BuildSettings();
            BuildModel();
            return new InitRegistrationModel
            {
                Settings = _settings,
                Registration = _model,
            };
        }

        private void Load()
        {
            _isBonusSystemActive = BonusSystem.IsActive &&  BonusSystem.ImplementICardService;
            
            if (_isBonusSystemActive
                && BonusSystem.IsInternal)
            {
                var bonuses = InternalBonusSystem.BonusesForNewCard;
                if (bonuses != 0)
                    _bonusesForNewCard = bonuses.FormatPrice();
            }
            
            _isDemo = Demo.IsDemoEnabled;
            _firstName = _isDemo ? Demo.GetRandomName() : null;
            _lastName = _isDemo ? Demo.GetRandomLastName() : null;
            _email = _isDemo ? Demo.GetRandomEmail() : null;
            _phone = _isDemo ? Demo.GetRandomPhone() : null;

            foreach (CustomerType customerType in Enum.GetValues(typeof(CustomerType)))
            {
                if (customerType == CustomerType.LegalEntity 
                    || customerType == CustomerType.PhysicalEntity)
                    _customerTypes.Add(new SelectListItem
                    {
                        Text = customerType == CustomerType.LegalEntity 
                            ? LocalizationService.GetResource("User.InitRegistration.LegalEntity")
                            : LocalizationService.GetResource("User.InitRegistration.PhysicalEntity"),
                        Value = customerType.ToString(),
                    });
            }

            _customerTypeByDefault = SettingsCustomers.IsRegistrationAsPhysicalEntity
                ? CustomerType.PhysicalEntity.ToString()
                : CustomerType.LegalEntity.ToString();
        }

        private void BuildSettings()
        {
            _settings = new RegistrationSettingsModel
            {
                AllCustomerTypes = 
                    SettingsCustomers.IsRegistrationAsLegalEntity 
                    && SettingsCustomers.IsRegistrationAsPhysicalEntity,
                CustomerTypeByDefault = _customerTypeByDefault,
                SuggestionsModule = 
                    AttachedModules.GetModules<ISuggestions>()
                        .Select(module => (ISuggestions)Activator.CreateInstance(module))
                        .FirstOrDefault(),
                CustomerFirstNameField = SettingsCheckout.CustomerFirstNameField,
                IsShowLastName = SettingsCheckout.IsShowLastName,
                IsRequiredLastName = SettingsCheckout.IsRequiredLastName,
                IsShowPatronymic = SettingsCheckout.IsShowPatronymic,
                IsRequiredPatronymic = SettingsCheckout.IsRequiredPatronymic,
                IsShowEmail = SettingsCheckout.IsShowEmail,
                IsRequiredEmail = SettingsCheckout.IsRequiredEmail,
                AuthByCodeActive = SettingsAuth.AuthByCodeActive,
                CustomerPhoneField = SettingsCheckout.CustomerPhoneField,
                IsShowPhone = SettingsCheckout.IsShowPhone,
                IsRequiredPhone = SettingsCheckout.IsRequiredPhone,
                EnablePhoneMask = SettingsMain.EnablePhoneMask,
                BirthDayFieldName = SettingsCheckout.BirthDayFieldName,
                IsShowBirthDay = SettingsCheckout.IsShowBirthDay,
                IsRequiredBirthDay = SettingsCheckout.IsRequiredBirthDay,
                IsBonusSystemActive = _isBonusSystemActive,
                BonusesForNewCard = _bonusesForNewCard,
                IsDemo = Demo.IsDemoEnabled,
                IsShowUserAgreementText = SettingsCheckout.IsShowUserAgreementText,
                UserAgreementText = SettingsCheckout.UserAgreementText,
                CustomerTypes = _customerTypes,
                EnableCaptchaInRegistration = SettingsMain.EnableCaptchaInRegistration,
                ShowUserAgreementForPromotionalNewsletter = SettingsDesign.ShowUserAgreementForPromotionalNewsletter,
                UserAgreementForPromotionalNewsletter = SettingsDesign.UserAgreementForPromotionalNewsletter,
                PartnersActive = SettingsMain.PartnersActive,
                UseEmailConfirmation = SettingsAuth.UseEmailConfirmation && SettingsMail.IsMailServiceEnabled,
                UsePhoneConfirmation = SettingsAuth.UsePhoneConfirmation 
                                       && (SettingsAuth.AuthByCodeActive 
                                           || ModulesPhoneConfirmationService.IsExistsPhoneConfirmedModules()),
            };
        }

        private void BuildModel()
        {
            _model = new RegistrationModel
            {
                Email = _email,
                FirstName = _firstName,
                LastName = _lastName,
                Phone = _phone,
                WantBonusCard = _isBonusSystemActive,
                CustomerType = _customerTypeByDefault,
                Agree = SettingsCheckout.AgreementDefaultChecked,
                UserAgreementForPromotionalNewsletter = SettingsDesign.SetUserAgreementForPromotionalNewsletterChecked,
            };
        }
    }
}