namespace AdvantShop.CriticalCss.DTOs
{
    public sealed class CriticalCssBundleCookieDto
    {
        public string Name { get; set; }
        
        public string Value { get; set; }
        
        public string Url { get; set; }
        
        public string Domain { get; set; }
        
        public string Path { get; set; }
        
        public long? Expires { get; set; }
        
        public bool? HttpOnly { get; set; }
        
        public bool? Secure { get; set; }
        
        public string SameSite { get; set; }
    }
}