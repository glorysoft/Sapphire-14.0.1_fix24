namespace AdvantShop.Models.User
{
    public sealed class InitRegistrationModel
    {
        public RegistrationSettingsModel Settings { get; set; }
        public RegistrationModel Registration { get; set; }
    }
}