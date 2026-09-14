namespace AdvantShop.Module.RemindAboutReceipt.Models
{
    public class BannersSettingsModel
    {
        public bool BannersSettingsActive { get; set; }

        public string FirstBannerImage { get; set; }

        public string FirstBannerUrl { get; set; }

        public bool FirstBannerTargetBlank { get; set; }

        public string SecondBannerImage { get; set; }

        public string SecondBannerUrl { get; set; }

        public bool SecondBannerTargetBlank { get; set; }

        public string ThirdBannerImage { get; set; }

        public string ThirdBannerUrl { get; set; }

        public bool ThirdBannerTargetBlank { get; set; }

        public string Host { get; set; }
    }
}
