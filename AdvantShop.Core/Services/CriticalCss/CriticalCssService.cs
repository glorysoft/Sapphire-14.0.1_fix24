using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Caching;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Scheduler.QuartzJobLogging;
using AdvantShop.CriticalCss.Enums;
using AdvantShop.CriticalCss.Params;
using AdvantShop.Diagnostics;
using Newtonsoft.Json;
using Quartz;

namespace AdvantShop.CriticalCss
{
    public static partial class CriticalCssService
    {
        public static string GetCriticalCss(
            string areaName,
            List<string> assets,
            List<string> keys
        )
        {
            var cssSb = new StringBuilder();
            var pathData = new AssetsTool.PathData(areaName);

            cssSb.Append(GetAngularCriticalCss());
            cssSb.Append(GetPresetCriticalCss());
            cssSb.Append(GetAssetsCriticalCss(assets, pathData));
            cssSb.Append(GetKeysCriticalCss(keys));

            return cssSb.ToString();
        }

        public static string GetLandingCss()
        {
            var landingParams = new CriticalCssLandingParams();
            return GetCss(CriticalCssNames.GetLandingName(landingParams.SiteUrl, landingParams.Url))
                   ?? DefaultLandingCss;
        }

        public static void Process(IJobExecutionContext jobContext = null)
        {
            if (CriticalCssStateManager.IsRun)
                return;

            CriticalCssStateManager.IsRun = true;
            
            var template = SettingsDesign.Template;
            var tasks = new List<CriticalCssTask>();

            foreach (var device in Enum.GetValues(typeof(CriticalCssDevice)).Cast<CriticalCssDevice>())
            {
                try
                {
                    var bundles = GetAllBundles();
                    var existsBundlesKeys = GetExistsKeys(device, template);
                    var bundlesKeysOnRemove = bundles
                        .Where(bundle =>
                            existsBundlesKeys.Any(key => bundle.Key.Equals(key)))
                        .Select(bundle => bundle.Key)
                        .ToList();

                    foreach (var bundleKey in bundlesKeysOnRemove)
                        bundles.Remove(bundleKey);

                    if (bundles.Count == 0) continue;

                    var bundlesGroups = 
                        bundles
                            .Select((bundle, index) => new { bundle, index })
                            .GroupBy(link => link.index / CountBundlesPerRequest)
                            .Select(group => group.ToDictionary(
                                link => link.bundle.Key,
                                link => link.bundle.Value
                            ));

                    foreach (var bundlesGroup in bundlesGroups)
                    {
                        try
                        {
                            var externalTask = CreateCssRequest(device, bundlesGroup);
                            
                            if (jobContext != null)
                                jobContext.LogInformation(string.Format(
                                    "Task successfully created with id '{0}'. Task: {1}",
                                    externalTask.TaskId,
                                    JsonConvert.SerializeObject(externalTask)
                                ));

                            tasks.Add(new CriticalCssTask(externalTask, device));
                        }
                        catch (Exception exception)
                        {
                            ProcessError(
                                string.Format(
                                    "Error while sending critical styles for device type \"{0}\". Error: {1}",
                                    device.ToString(),
                                    exception.Message
                                ),
                                exception: exception,
                                jobContext: jobContext
                            );
                        }
                    }
                }
                catch (Exception exception)
                {
                    ProcessError(
                        string.Format(
                            "Unexpected error while preparation sending critical styles for device type \"{0}\". " +
                            "Error: {1}",
                            device.ToString(),
                            exception.Message
                        ),
                        exception: exception,
                        jobContext: jobContext
                    );
                }
            }

            if (tasks.Count != 0)
                DelayHelper.Wait(
                    tasks.Max(task => task.AverageWaitTimeMs),
                    DelayType.Milliseconds,
                    () => AddStylesByTasks(tasks, template, jobContext)
                );
            else
                ProcessEnd(jobContext);
        }

        private static void ProcessEnd(IJobExecutionContext jobContext = null)
        {
            if (jobContext != null)
                jobContext.LogInformation("Critical css process is finished.");
            
            CriticalCssStateManager.IsRun = false;
        }

        private static void ProcessError(
            string message, 
            Exception exception = null, 
            IJobExecutionContext jobContext = null
        )
        {
            if (jobContext != null)
                jobContext.LogInformation(message);
                
            if (exception == null)
                Debug.Log.Error(message);
            else
                Debug.Log.Error(message, exception);
        }

        private static void AddStylesByTasks(
            List<CriticalCssTask> tasks,
            string template,
            IJobExecutionContext jobContext = null,
            int iterator = 1
        )
        {
            if (tasks == null || tasks.Count == 0)
            {
                ProcessEnd(jobContext);
                return;
            }
            
            if (iterator > GetDataAttempts)
            {
                ProcessError(
                    $"Error: Request limit reached ({GetDataAttempts}). Critical styles could not be retrieved.",
                    jobContext: jobContext
                );
                ProcessEnd(jobContext);
                return;
            }

            if (!template.Equals(SettingsDesign.Template, StringComparison.OrdinalIgnoreCase))
            {
                ProcessError(
                    "CriticalCssService: During the process of obtaining critical css, the site template was changed", 
                    jobContext: jobContext
                );
                ProcessEnd(jobContext);
                return;
            }

            foreach (var task in tasks)
            {
                try
                {
                    var response = GetCssRequest(task.TaskId);

                    if (response == null)
                    {
                        if (jobContext != null)
                            jobContext.LogInformation(string.Format(
                                "Task with id '{0}' is not ready yet. Attempt {1}.",
                                task.TaskId,
                                iterator
                            ));
                        continue;
                    }
                
                    if (jobContext != null)
                        jobContext.LogInformation(string.Format(
                            "Task with id '{0}' ready. Attempt {1}.",
                            task.TaskId,
                            iterator
                        ));
                    
                    foreach (var bundle in response.Bundles)
                        if(!string.IsNullOrWhiteSpace(bundle.Value))
                        {
                            var criticalCss = new CriticalCss
                            {
                                Key = bundle.Key,
                                Value = bundle.Value,
                                Device = task.Device,
                                Template = template,
                                NeedUpdate = false,
                                UpdateAt = DateTime.Now
                            };

                            if (IsExistCss(criticalCss.Key, criticalCss.Template, criticalCss.Device))
                            {
                                UpdateCss(criticalCss);
                                
                                if (jobContext != null)
                                    jobContext.LogInformation(string.Format(
                                        "Bundle with key '{0}' in task with id '{1}' updated to the database.",
                                        bundle.Key,
                                        task.TaskId
                                    ));
                            }
                            else
                            {
                                AddCss(criticalCss);
                                
                                if (jobContext != null)
                                    jobContext.LogInformation(string.Format(
                                        "Bundle with key '{0}' in task with id '{1}' added to the database.",
                                        bundle.Key,
                                        task.TaskId
                                    ));
                            }
                        }
                        else
                        {
                            ProcessError(
                                string.Format(
                                    "Error: In bundle with key '{0}' in task with id '{1}', the value was empty. " +
                                    "Device - {2}. Template - {3}. Answer - {4}",
                                    bundle.Key,
                                    task.TaskId,
                                    task.Device.StrName(),
                                    template,
                                    JsonConvert.SerializeObject(response)
                                ),
                                jobContext: jobContext
                            );
                        }


                    foreach (var error in response.Errors)
                        ProcessError(
                            string.Format(
                                "Error: The request returned an error. Task with id '{0}'. Error - {1}",
                                task.TaskId, 
                                JsonConvert.SerializeObject(error)
                            ),
                            jobContext: jobContext
                        );
                    
                    task.IsComplite = true;
                }
                catch (Exception exception)
                {
                    Debug.Log.Error(exception.Message, exception);
                    task.IsComplite = true;
                }
            }
            
            var notCompletedTasks = tasks.Where(task => !task.IsComplite).ToList();

            if (notCompletedTasks.Count == 0)
            {
                ProcessEnd(jobContext);
                return;
            }

            iterator++;

            if (tasks.Count == 0)
            {
                ProcessEnd(jobContext);
                return;
            }
            
            if (iterator > GetDataAttempts)
            {
                ProcessError(
                    $"Error: Request limit reached ({GetDataAttempts}). Critical styles could not be retrieved.",
                    jobContext: jobContext
                );
                ProcessEnd(jobContext);
                return;
            }
            
            DelayHelper.Wait(
                notCompletedTasks.Max(task => task.AverageWaitTimeMs),
                DelayType.Milliseconds,
                () => AddStylesByTasks(notCompletedTasks, template, jobContext, iterator));
        }

        private static string GetCssFileContent(
            string assetName,
            AssetsTool.PathData pathData
        )
        {
            var cssFileName = $"{assetName}.critical.css";
            var cacheKey = pathData.GetCacheKey(cssFileName);

            var css = string.Empty;

            if (CacheManager.TryGetValue(cacheKey, out css))
                return css;

            var file = pathData.GetPathAbs(cssFileName, "_criticalcss");
            if (!File.Exists(file))
            {
                CacheManager.Insert(cacheKey, string.Empty, 20);
                return null;
            }

            string content = null;
            try
            {
                content = File.ReadAllText(file);
            }
            catch (Exception ex)
            {
                Debug.Log.Error("AssetsTool, GetCriticalCss, file: " + file, ex);
            }

            if (content != null)
                CacheManager.Insert(
                    cacheKey,
                    content,
                    60,
                    new CacheDependency(file),
                    CacheItemPriority.Default);

            return content;
        }

        private static string GetAngularCriticalCss() =>
            new StringBuilder()
                .Append("[ng\\:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak, ")
                .Append(".ng-hide:not(.ng-hide-animate) {display: none !important;} ng\\:form, form {display: block;} ")
                .Append(".ng-animate-shim {visibility: hidden;} .ng-anchor {position: absolute;} ")
                .ToString();

        private static string GetPresetCriticalCss() =>
            new StringBuilder()
                .Append(".sidebar-content-static {visibility: hidden;}.visibility-hidden{visibility: hidden;}")
                .ToString();

        private static string GetAssetsCriticalCss(
            List<string> assets, 
            AssetsTool.PathData pathData
        )
        {
            if (assets == null && assets.Count == 0) return string.Empty;

            var sb = new StringBuilder();

            foreach (var asset in assets.Distinct())
            {
                var css = string.Empty;

                switch (asset)
                {
                    case "home":
                        var mainParams = new CriticalCssMainParams();
                        css = GetCss(CriticalCssNames.GetMainName(mainParams.PageMode));
                        break;
                    case "brand":
                        css = GetCss(CriticalCssNames.GetBrandName());
                        break;
                    case "cart":
                        css = GetCss(CriticalCssNames.GetCartName());
                        break;
                    case "catalog":
                        var catalogParams = new CriticalCssCatalogParams();
                        css = GetCss(CriticalCssNames.GetCatalogName(catalogParams.ViewMode));
                        break;
                    case "catalogSearch":
                        css = GetCss(CriticalCssNames.GetCatalogSearchName());
                        break;
                    case "checkout":
                        css = GetCss(CriticalCssNames.GetCheckoutName());
                        break;
                    case "compare":
                        css = GetCss(CriticalCssNames.GetCompareName());
                        break;
                    case "error":
                        css = GetCss(CriticalCssNames.GetErrorName());
                        break;
                    case "feedback":
                        css = GetCss(CriticalCssNames.GetFeedbackName());
                        break;
                    case "giftcertificate":
                        css = GetCss(CriticalCssNames.GetGiftCertificateName());
                        break;
                    case "recoveryPassword":
                        css = GetCss(CriticalCssNames.GetRecoveryPasswordName());
                        break;
                    case "login":
                        css = GetCss(CriticalCssNames.GetLoginName());
                        break;
                    case "myaccount":
                        css = GetCss(CriticalCssNames.GetMyAccountName());
                        break;
                    case "news":
                        css = GetCss(CriticalCssNames.GetNewsName());
                        break;
                    case "product":
                        css = GetCss(CriticalCssNames.GetProductName());
                        break;
                    case "productList":
                        var productListParams = new CriticalCssProductListParams();
                        css = GetCss(CriticalCssNames.GetProductListName(
                            productListParams.Type,
                            productListParams.List));
                        break;
                    case "staticPage":
                        var staticPageParams = new CriticalCssStaticPageParams();
                        css = GetCss(CriticalCssNames.GetStaticPageName(staticPageParams.Url));
                        break;
                    case "wishlist":
                        css = GetCss(CriticalCssNames.GetWishlistName());
                        break;
                    case "bonusPage":
                        css = GetCss(CriticalCssNames.GetBonusCardName());
                        break;
                    case "newsItem":
                        css = GetCss(CriticalCssNames.GetNewsItemName());
                        break;
                    case "brandItem":
                        css = GetCss(CriticalCssNames.GetBrandItemName());
                        break;
                    case "checkoutSuccess":
                        css = GetCss(CriticalCssNames.GetCheckoutSuccessName());
                        break;
                }

                if (string.IsNullOrWhiteSpace(css))
                {
                    var content = GetCssFileContent(asset, pathData);

                    if (content.IsNotEmpty())
                        sb.Append(content);

                    continue;
                }

                sb.Append(css);
            }

            return sb.ToString();
        }

        private static string GetKeysCriticalCss(List<string> keys)
        {
            if (keys == null && keys.Count == 0) return string.Empty;
            
            var sb = new StringBuilder();
                
            foreach (var css in
                     keys.Select(GetCss)
                         .Where(css => !string.IsNullOrWhiteSpace(css)))
                sb.Append(css);
            
            return sb.ToString();
        }
    }
}