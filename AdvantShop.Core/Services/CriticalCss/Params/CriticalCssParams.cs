using System.Web;

namespace AdvantShop.CriticalCss.Params
{
    public abstract class CriticalCssParams
    {
        protected static string GetUrlParameter(string parameter)
        {
            var context  = HttpContext.Current;
            if (context  == null) return null;
            
            var routeValue = context.Request?.RequestContext?.RouteData?.Values[parameter];
            if (routeValue != null)
                return routeValue.ToString();

            var uri = context.Request?.Url;
            if (uri == null) return null;
            
            var queryParams = HttpUtility.ParseQueryString(uri.Query);
            return queryParams.Get(parameter);
        }
    }
}