using System.Web;

namespace AdvantShop.Core.Services.Catalog
{
    public class PriceRulesContext
    {
        public static int? CurrentPriceRuleId
        {
            get =>
                HttpContext.Current != null && HttpContext.Current.Items["CurrentPriceRuleId"] != null
                    ? HttpContext.Current.Items["CurrentPriceRuleId"] as int?
                    : null;
            set
            {
                if (HttpContext.Current == null)
                    return;

                HttpContext.Current.Items["CurrentPriceRuleId"] = value;
            }
        }
    }
}