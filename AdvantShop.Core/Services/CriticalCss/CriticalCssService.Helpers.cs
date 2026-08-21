using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Landing.Settings;

namespace AdvantShop.CriticalCss
{
    public static partial class CriticalCssService
    {
        private static bool IsAccessAllow(this LpSettingsService service, int id) =>
            service.Get(id, "SeoSettings.AllowAccess").TryParseBool();

        private static bool IsAuthRequire(this LpSiteSettingsService service, int id) =>
            service.Get(id, "AuthSettings.RequireAuth").TryParseBool();
    }
}