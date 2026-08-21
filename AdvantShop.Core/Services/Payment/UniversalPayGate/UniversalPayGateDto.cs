namespace AdvantShop.Payment
{
    public class UniversalPayGateDto
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public string UrlTest { get; set; }
        public int SortOrder { get; set; }
        public string LinkHelp { get; set; }
        public string TextLinkHelp { get; set; }
        public string NotificationUrl { get; set; }
        public string SuccessUrl { get; set; }
        public string CancelUrl { get; set; }
    }
}