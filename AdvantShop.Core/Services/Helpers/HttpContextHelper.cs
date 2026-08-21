using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Diagnostics;

namespace AdvantShop.Core.Services.Helpers
{
    public static class HttpContextHelper
    {
        public static string TryGetIp(this HttpContext context)
        {
            try
            {
                if (context == null)
                    return null;
                
                var ip = context.Request.Headers["X-1Gb-Client-IP"]
                         ?? context.Request.Headers["X-Real-IP"]
                         ?? context.Request.Headers["X-Forwarded-For"]
                         ?? context.Request.UserHostAddress;
                
                return ip;
            }
            catch
            {
                // ignored
            }
            return null;
        }
        public static string TryGetIp(this HttpContextBase context)
        {
            try
            {
                if (context == null)
                    return null;
                
                var ip = context.Request.Headers["X-1Gb-Client-IP"]
                         ?? context.Request.Headers["X-Real-IP"]
                         ?? context.Request.Headers["X-Forwarded-For"]
                         ?? context.Request.UserHostAddress;
                
                return ip;
            }
            catch
            {
                // ignored
            }
            return null;
        }

        public static (byte[], string) TryGetIpBytes(this HttpContext context)
        {
            try
            {
                var ip = context.TryGetIp();
                if (ip.IsNullOrEmpty())
                    return (null, null);

                return (ip.TryGetIpBytes(), ip);
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
            
            return (null, null);
        }
        
        public static (byte[], string) TryGetIpBytes(this HttpContextBase context)
        {
            try
            {
                var ip = context.TryGetIp();
                if (ip.IsNullOrEmpty())
                    return (null, null);

                return (ip.TryGetIpBytes(), ip);
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
            
            return (null, null);
        }

        public static byte[] TryGetIpBytes(this string ip)
        {
            var rawIp = ip?.Split(',')[0].Trim();
            
            if (string.IsNullOrEmpty(rawIp))
                return null;

            if (!IPAddress.TryParse(rawIp, out var parsedIp))
                return null;

            if (parsedIp.IsIPv4MappedToIPv6)
                parsedIp = parsedIp.MapToIPv4();

            return parsedIp.GetAddressBytes();
        }
        
        public static bool TryGetRequest(this HttpContext context, out HttpRequest request)
        {
            request = null;
            
            try
            {
                if (context == null)
                    return false;
                
                request = context.Request;

                return true;
            }
            catch
            {
                // ignored
            }
            return false;
        }

        public static void HiddenBottomPanel(this HttpContextBase context) =>
            context.Request.RequestContext.HttpContext.Items["IsBottomPanelHidden"] = true;

        public static bool IsHiddenBottomPanel(this HttpContextBase context)
        {
            if (context.Request.RequestContext.HttpContext.Items["IsBottomPanelHidden"] != null
                && bool.TryParse(
                    context.Request.RequestContext.HttpContext.Items["IsBottomPanelHidden"].ToString(),
                    out var isHidden))
                return isHidden;
            
            return false;
        }

        private static readonly ConcurrentDictionary<string, bool> IsJsonResultCache =
            new ConcurrentDictionary<string, bool>(StringComparer.OrdinalIgnoreCase);

        public static bool IsJsonResult(this HttpRequest request) =>
            new HttpRequestWrapper(request).IsJsonResult();

        public static bool IsJsonResult(this HttpRequestBase request)
        {
            const string cacheTemplate = "IsJsonResult_{0}/{1}";
            var routeData = RouteTable.Routes.GetRouteData(request.RequestContext.HttpContext);
            if (routeData == null)
                return false;

            var controllerName = routeData.Values["controller"]?.ToString();
            var actionName = routeData.Values["action"]?.ToString();

            if (string.IsNullOrEmpty(controllerName) || string.IsNullOrEmpty(actionName))
                return false;

            var cacheKey = string.Format(cacheTemplate, controllerName, actionName);
            return IsJsonResultCache.GetOrAdd(cacheKey, _ => ResolveIsJsonResult(controllerName, actionName));
        }

        private static bool ResolveIsJsonResult(string controllerName, string actionName)
        {
            Type controllerType = null;
            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies().Where(assembly => 
                         assembly.FullName.StartsWith("AdvantShop.", StringComparison.OrdinalIgnoreCase) 
                         && !assembly.FullName.EndsWith(".CRUSHED", StringComparison.OrdinalIgnoreCase)))
            {
                try
                {
                    controllerType = assembly.GetTypes()
                        .FirstOrDefault(type => type.Name.Equals(
                            $"{controllerName}Controller",
                            StringComparison.OrdinalIgnoreCase
                        ));
                }
                catch (ReflectionTypeLoadException)
                {
                    // игнорируем сборки, типы которых не удаётся загрузить
                }
                
                if (controllerType != null)
                    break;
            }

            if (controllerType == null)
                return false;

            var methodInfos = controllerType.GetMethods()
                .Where(info => info.Name.Equals(actionName, StringComparison.OrdinalIgnoreCase))
                .ToList();

            // на случай, когда в контроллере есть методы MVC на GET и POST, которые обычно с одним названием функции 
            if (methodInfos.Count != 1)
                return false;

            return methodInfos[0].ReturnType == typeof(JsonResult);
        }
    }
}