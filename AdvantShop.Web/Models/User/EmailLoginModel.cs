namespace AdvantShop.Models.User
{
    public sealed class EmailLoginModel : AuthCaptchaModel
    {
        public string Email { get; set; } 
        public string Password { get; set; }
    }
}