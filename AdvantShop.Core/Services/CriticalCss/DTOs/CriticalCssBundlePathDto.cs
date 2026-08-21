using System.Collections.Generic;

namespace AdvantShop.CriticalCss.DTOs
{
    public sealed class CriticalCssBundlePathDto
    {
        public string Path { get; set; }

        public IEnumerable<CriticalCssBundleCookieDto> Cookies { get; set; }

        public int? ExpectedStatusCode { get; set; }

        public CriticalCssBundlePathDto()
        {
        }

        public CriticalCssBundlePathDto(string path)
        {
            Path = path;
        }
    }
}