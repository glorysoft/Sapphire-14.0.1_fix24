using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Compilation;
using System.Web.Hosting;
using AdvantShop.Configuration;
using AdvantShop.Core.Common;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Design;
using Debug = AdvantShop.Diagnostics.Debug;

namespace AdvantShop.Warmup
{
    public static class ViewsWarmupService
    {
        private const string ClientViewsPath = "Views";
        private const string MobileClientViewsPath = @"Areas\Mobile\Views";
        private const string AdminViewsPath = @"Areas\Admin\Views";
        private const string MobileAdminViewsPath = @"Areas\Admin\Templates\Mobile\Views";
        private const string AdminV3ViewsPath = @"Areas\Admin\Templates\AdminV3\Views";

        private const string TemplateViewsPath = @"Templates\{0}\Views";
        private const string MobileTemplateViewsPath = @"Templates\{0}\Areas\Mobile\Views";
        
        private const string ModuleViewsPath = @"Modules\{0}\Views";

        public static void Start()
        {
            if (!FeaturesService.IsEnabled(EFeature.Warmup))
                return;

            DelayHelper.Wait(new Random().Next(1, 11), DelayType.Minutes, () =>
            {
                var appPath = HostingEnvironment.ApplicationPhysicalPath;
                if (string.IsNullOrWhiteSpace(appPath))
                    return;

                WarmupArea(appPath, ClientViewsPath);
                WarmupArea(appPath, MobileClientViewsPath);
                WarmupTemplate(appPath);
                WarmupArea(appPath, AdminViewsPath);
                WarmupArea(appPath, MobileAdminViewsPath);
                WarmupArea(appPath, AdminV3ViewsPath);
                WarmupAllModules(appPath);
            });
        }

        /// <summary>
        /// Extension method for a module to build (warmup) its views.
        /// </summary>
        /// <param name="module"></param>
        public static void StartWarmupViews(this IModule module)
        {
            if (!FeaturesService.IsEnabled(EFeature.Warmup))
                return;

            Task.Run(() => { module.WarmupModule(); });
        }

        public static void StartWarmupTemplate()
        {
            if (!FeaturesService.IsEnabled(EFeature.Warmup))
                return;

            Task.Run(() => { WarmupTemplate(); });
        }

        private static void WarmupAllModules(string appPath = null, bool ignoreActive = true)
        {
            var modules = AttachedModules.GetModuleInstances<IModule>(ignoreActive);
            
            if (modules == null || !modules.Any())
                return;
            
            if (string.IsNullOrWhiteSpace(appPath)) 
                appPath = HostingEnvironment.ApplicationPhysicalPath;
            
            foreach (var module in modules)
                module.WarmupModule(appPath);
        }

        private static void WarmupModule(this IModule module, string appPath = null)
        {
            if (module == null || string.IsNullOrWhiteSpace(module.ModuleStringId))
                return;
            
            if (string.IsNullOrWhiteSpace(appPath)) 
                appPath = HostingEnvironment.ApplicationPhysicalPath;
            
            if (string.IsNullOrWhiteSpace(appPath))
                return;
            
            WarmupArea(appPath, string.Format(ModuleViewsPath, module.ModuleStringId));
        }

        private static void WarmupTemplate(string appPath = null)
        {
            var template = SettingsDesign.Template;
            
            if (template.Equals(TemplateService.DefaultTemplateId))
                return;
            
            if (string.IsNullOrWhiteSpace(appPath)) 
                appPath = HostingEnvironment.ApplicationPhysicalPath;
            
            if (string.IsNullOrWhiteSpace(appPath))
                return;
            
            WarmupArea(appPath, string.Format(TemplateViewsPath, template));
            WarmupArea(appPath, string.Format(MobileTemplateViewsPath, template));
        }

        private static void WarmupArea(string appPath, string area)
        {
            var areaPath = appPath.TrimEnd('\\').TrimEnd('/') + '\\' + area.TrimStart('\\').TrimStart('/');
            
            if (!Directory.Exists(areaPath))
                return;

            var virtualPaths = Directory.GetFiles(areaPath, "*.cshtml", SearchOption.AllDirectories)
                .Select(file => "~/" + file.Substring(appPath.Length).Replace('\\', '/'))
                .ToList();
            
            if (!virtualPaths.Any())
                return;

            var warmupLog = new WarmupLogService($"Views warmup: \"{areaPath.Substring(appPath.Length)}\"");

            warmupLog.Start();

            foreach (var virtualPath in virtualPaths)
                virtualPath.WarmupView();
            
            warmupLog.Finish();
        }

        private static void WarmupView(this string virtualPath)
        {
            try
            {
                BuildManager.GetCompiledType(virtualPath);
            }
            catch (Exception exception)
            {
                Debug.Log.Warn($"Views warmup error for \"{virtualPath}\": {exception.Message}", exception);
            }
        }
    }
}