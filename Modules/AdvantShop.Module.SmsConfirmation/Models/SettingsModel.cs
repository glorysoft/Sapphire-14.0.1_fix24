namespace AdvantShop.Module.SmsConfirmation.Models
{
    public class SettingsModel
    {
        public bool RegistrationPageActive { get; set; }

        public bool AuthorizationPageActive { get; set; }

        public bool CheckoutPageActive { get; set; }

        public string FormContent { get; set; }

        public string FormTitle { get; set; }

        public string ActiveModule { get; set; }

        public string ActiveModuleLink { get; set; }

        public bool UseCaptcha { get; set; }
    }
}
