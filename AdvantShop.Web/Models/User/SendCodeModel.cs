namespace AdvantShop.Models.User
{
    public sealed class SendCodeModel : AuthCaptchaModel
    {
        public string Phone { get; set; }
        
        /// <summary>
        /// Is registration (else authorization)
        /// </summary>
        public bool SignUp { get; set; }
    }
}