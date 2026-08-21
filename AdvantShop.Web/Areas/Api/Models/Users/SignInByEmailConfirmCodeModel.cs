namespace AdvantShop.Areas.Api.Models.Users
{
    public sealed class SignInByEmailConfirmCodeModel
    {
        public string Email { get; set; }
        public string Code { get; set; }
    }
}