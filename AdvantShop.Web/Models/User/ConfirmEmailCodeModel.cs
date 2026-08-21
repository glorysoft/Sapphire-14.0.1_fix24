namespace AdvantShop.Models.User
{
    public sealed class ConfirmEmailCodeModel : AuthCaptchaModel
    {
        public string Email { get; set; }
        public string Code { get; set; }
        public bool Authorize { get; set; }
    }
}