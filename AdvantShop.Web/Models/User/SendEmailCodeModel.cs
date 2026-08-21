namespace AdvantShop.Models.User
{
    public sealed class SendEmailCodeModel : AuthCaptchaModel
    {
        public string Email { get; set; }
        
        public bool Authorize { get; set; }
    }
}