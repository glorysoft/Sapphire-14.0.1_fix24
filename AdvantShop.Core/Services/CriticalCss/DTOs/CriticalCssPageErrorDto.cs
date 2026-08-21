namespace AdvantShop.CriticalCss.DTOs
{
    public sealed class CriticalCssPageErrorDto
    {
        public string Message { get; set; }
        public long StatusCode { get; set; }
        public string Url { get; set; }
        public CriticalCssOptionsDto Options { get; set; }
    }
}