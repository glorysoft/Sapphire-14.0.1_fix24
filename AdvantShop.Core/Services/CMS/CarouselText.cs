namespace AdvantShop.Core.Services.CMS
{
    public class CarouselText
    {
        public int Id { get; set; }
        public int CarouselId { get; set; }
        public string Title { get; set; }
        public int TitleSize { get; set; }
        public float TitleLineHeight { get; set; }
        public string Text { get; set; }
        public int TextSize { get; set; }
        public float TextLineHeight { get; set; }
        public string ColorCode { get; set; }
        public int BlockSize { get; set; }
        public ETextAlignment Alignment { get; set; }
        public ETextPositionHorizontal PositionHorizontal { get; set; }
        public ETextPositionVertical PositionVertical { get; set; }
        public ETextAnimation Animation { get; set; }
        public bool Enabled { get; set; }

        public string CssClassText => $"carousel-text-block--vertical-{PositionVertical.ToString().ToLower()} " +
                                      $"carousel-text-block--horizontal-{PositionHorizontal.ToString().ToLower()} " +
                                      $"carousel-text-block--align-{Alignment.ToString().ToLower()}";
    }
}