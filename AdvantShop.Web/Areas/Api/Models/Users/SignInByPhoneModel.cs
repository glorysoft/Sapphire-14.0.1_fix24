namespace AdvantShop.Areas.Api.Models.Users
{
    public sealed class SignInByPhoneModel
    {
        public string Phone { get; set; }
        public bool SignUp { get; set; }
        public bool AddHash { get; set; }
        public string CaptchaToken { get; set; }
    }
    
    public sealed class SignInByPhoneConfirmCodeModel
    {
        public string Phone { get; set; }
        public string Code { get; set; }
        public bool SignUp { get; set; }
    }
}