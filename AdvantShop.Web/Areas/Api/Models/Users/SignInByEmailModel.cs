namespace AdvantShop.Areas.Api.Models.Users
{
    public sealed class SignInByEmailModel
    {
        public string Email { get; set; }
        public string CaptchaToken { get; set; }
    }
}