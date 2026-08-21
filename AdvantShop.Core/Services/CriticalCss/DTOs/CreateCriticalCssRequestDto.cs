using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace AdvantShop.CriticalCss.DTOs
{
    public sealed class CreateCriticalCssRequestDto
    {
        [JsonProperty("baseUrl")] 
        public string BaseUrl { get; set; }

        [JsonProperty("bundles")] 
        public IEnumerable<CriticalCssBundleDto> Bundles { get; set; }

        [JsonProperty("options")] 
        public IEnumerable<CriticalCssOptionsDto> Options { get; set; }

        public CreateCriticalCssRequestDto(
            string baseUrl,
            CriticalCssOptionsDto option,
            IEnumerable<KeyValuePair<string, IEnumerable<CriticalCssBundlePathDto>>> bundles
        )
        {
            BaseUrl = baseUrl;
            Bundles = bundles
                .Select(bundle => new CriticalCssBundleDto
                {
                    Name = bundle.Key,
                    Paths = bundle.Value,
                })
                .ToList();
            Options = new List<CriticalCssOptionsDto> { option };
        }
    }
}