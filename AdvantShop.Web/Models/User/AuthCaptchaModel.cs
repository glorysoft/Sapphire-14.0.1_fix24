namespace AdvantShop.Models.User
{
    public abstract class AuthCaptchaModel
    {
        public string InputValue { get; set; }
        
        public string CaptchaId { get; set; } 
        
        public string CaptchaInstanceId { get; set; }
    }
}