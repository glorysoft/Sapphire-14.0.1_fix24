using System.Collections.Generic;
using AdvantShop.CriticalCss.DTOs;

namespace AdvantShop.Core.Modules.Interfaces
{
    public interface ICriticalCss
    {
        Dictionary<string, IEnumerable<CriticalCssBundlePathDto>> Bundles();
    }
}