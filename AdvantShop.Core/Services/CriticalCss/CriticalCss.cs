using System;
using AdvantShop.CriticalCss.Enums;

namespace AdvantShop.CriticalCss
{
    public sealed class CriticalCss
    {
        public int Id { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
        public CriticalCssDevice Device { get; set; }
        public string Template { get; set; }
        public bool NeedUpdate { get; set; }
        public DateTime UpdateAt { get; set; }
    }
}