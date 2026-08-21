using System.Globalization;
using System.Threading;
using System.Web;
using AdvantShop.Localization;

namespace AdvantShop.Core.Common.Extensions
{
    public static class Threads
    {
        public static Thread SetCulture(this Thread val, string lang = "")
        {
            var culture = Culture.GetCulture(lang);
            val.CurrentCulture = culture;
            val.CurrentUICulture = culture;
            CultureInfo.DefaultThreadCurrentCulture = culture;
            CultureInfo.DefaultThreadCurrentUICulture = culture;
            
            if (HttpContext.Current != null)
                HttpContext.Current.Items["Culture"] = culture.Name;
            
            return val;
        }
    }
}