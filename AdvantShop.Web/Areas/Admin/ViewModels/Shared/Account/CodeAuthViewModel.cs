namespace AdvantShop.Web.Admin.ViewModels.Shared.Account
{
    public class CodeAuthViewModel
    {
        public string Login { get; set; }
        public bool ShowCaptcha { get; set; }
        public bool CodeSent { get; set; }
        public bool IsBanned { get; set; }
        public string MainSiteName { get; set; }
    }
}