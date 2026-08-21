namespace AdvantShop.Core.Services.CMS
{
    public class CarouselButton
    {
        public int Id { get; set; }
        public int CarouselId { get; set; }
        public string Text { get; set; }
        public string Url { get; set; }
        public bool Blank { get; set; }
        public string ButtonColorCode { get; set; }
        public string TextColorCode { get; set; }
        public bool Enabled { get; set; }
        public bool UseStoreColorScheme { get; set; }
    }
}