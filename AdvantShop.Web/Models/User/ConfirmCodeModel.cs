namespace AdvantShop.Models.User
{
    public sealed class ConfirmCodeModel : AuthCaptchaModel
    {
        public string Phone { get; set; }
        public string Code { get; set; }
        public bool SignUp { get; set; }
    }
}