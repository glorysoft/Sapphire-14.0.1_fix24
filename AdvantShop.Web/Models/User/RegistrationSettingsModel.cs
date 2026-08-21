using System.Collections.Generic;
using System.Web.Mvc;
using AdvantShop.Core.Modules.Interfaces;

namespace AdvantShop.Models.User
{
    public sealed class RegistrationSettingsModel
    {
        public bool AllCustomerTypes { get; set; }
        public string CustomerTypeByDefault { get; set; }
        public ISuggestions SuggestionsModule { get; set; }
        public string CustomerFirstNameField { get; set; }
        public bool IsShowLastName { get; set; }
        public bool IsRequiredLastName { get; set; }
        public bool IsShowPatronymic { get; set; }
        public bool IsRequiredPatronymic { get; set; }
        public bool AuthByCodeActive { get; set; }
        public bool IsShowEmail { get; set; }
        public bool IsRequiredEmail { get; set; }
        public string CustomerPhoneField { get; set; }
        public bool IsShowPhone { get; set; }
        public bool IsRequiredPhone { get; set; }
        public bool EnablePhoneMask { get; set; }
        public string BirthDayFieldName { get; set; }
        public bool IsShowBirthDay { get; set; }
        public bool IsRequiredBirthDay { get; set; }
        public bool IsBonusSystemActive { get; set; }
        public string BonusesForNewCard { get; set; }
        public bool IsDemo { get; set; }
        public bool IsShowUserAgreementText { get; set; }
        public string UserAgreementText { get; set; }
        public List<SelectListItem> CustomerTypes { get; set; }
        public bool EnableCaptchaInRegistration { get; set; }
        public bool ShowUserAgreementForPromotionalNewsletter { get; set; }
        public string UserAgreementForPromotionalNewsletter { get; set; }
        public bool PartnersActive { get; set; }
        public bool IsPhoneConfirmationActive { get; set; }
        public bool UseEmailConfirmation { get; set; }
        public bool UsePhoneConfirmation { get; set; }
    }
}