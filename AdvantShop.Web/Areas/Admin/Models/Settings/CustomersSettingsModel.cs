using AdvantShop.Web.Admin.ViewModels.Catalog.Import;

namespace AdvantShop.Web.Admin.Models.Settings
{
    public class CustomersSettingsModel
    {
        public string ApplicationId { get; set; }
        public bool IsRegistrationAsLegalEntity { get; set; }
        public bool IsRegistrationAsPhysicalEntity { get; set; }
        public bool IsForbiddenAsChangingGeneralData { get; set; }
        public bool IsForbiddenAsChangingAddressBook { get; set; }
        public ImportCustomersModel ImportCustomersModel { get; set; }
        public float? MinimalOrderPriceForPhysicalEntity { get; set; }
        public float? MinimalOrderPriceForLegalEntity { get; set; }
    }
}