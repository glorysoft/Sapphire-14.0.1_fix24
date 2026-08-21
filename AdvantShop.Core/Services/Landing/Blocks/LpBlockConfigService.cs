using System;
using System.IO;
using System.Linq;
using System.Web.Hosting;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AdvantShop.Core.Services.Landing.Blocks
{
    public class LpBlockConfigService
    {
        public LpBlockConfig Get(string blockKey, string templateName)
        {
            return CacheManager.Get(LpConstants.LpBlockConfigCachePrefix + blockKey + templateName, LpConstants.LpCacheTime,
                () =>
                {
                    try
                    {
                        var path = string.Format("{0}/{1}/Blocks/{2}/", LpFiles.TepmlateFolder, templateName, blockKey);
                        var configPath = HostingEnvironment.MapPath(path + "config.json");

                        if (!File.Exists(configPath))
                        {
                            path = string.Format("{0}/Blocks/{1}/", LpFiles.ViewsFolder, blockKey);
                            configPath = HostingEnvironment.MapPath(path + "config.json");
                            if (!File.Exists(configPath))
                                return null;
                        }

                        var configContent = "";

                        using (var sr = new StreamReader(configPath))
                            configContent = sr.ReadToEnd();

                        var blockConfig = JsonConvert.DeserializeObject<LpBlockConfig>(configContent);
                        if (blockConfig != null)
                            blockConfig.BlockPath = path + blockKey + ".cshtml";

                        blockConfig = LocalizeBlock(blockConfig);

                        return blockConfig;
                    }
                    catch (Exception ex)
                    {
                        Debug.Log.Error(ex);
                    }

                    return null;
                });
        }

        private LpBlockConfig LocalizeBlock(LpBlockConfig config)
        {
            config.Description = !config.Description.IsNullOrEmpty() ? LocalizationService.GetResource(config.Description) : string.Empty;
            config.Category = !config.Category.IsNullOrEmpty() ? LocalizationService.GetResource(config.Category) : string.Empty;
            config.Name = !config.Name.IsNullOrEmpty() ? LocalizationService.GetResource(config.Name) : string.Empty;

            if (config.SubBlocks != null && config.SubBlocks.Count > 0)
            {
                foreach (var subBlock in config.SubBlocks)
                {
                    subBlock.Description = !subBlock.Description.IsNullOrEmpty() ? LocalizationService.GetResource(subBlock.Description) : string.Empty;
                    subBlock.Name = !subBlock.Name.IsNullOrEmpty() ? LocalizationService.GetResource(subBlock.Name) : string.Empty;
                    subBlock.Placeholder = !subBlock.Placeholder.IsNullOrEmpty() ? LocalizationService.GetResource(subBlock.Placeholder) : string.Empty;
                }
            }
            
            if (config.Settings != null)
            {
                var settingsType = config.Settings.GetType();
                var settingsJson = JsonConvert.SerializeObject(config.Settings);
                var settings = JObject.Parse(settingsJson);
                
                LocalizeSettingsObject(settings);
                
                config.Settings = JsonConvert.DeserializeObject(settings.ToString(), settingsType);
            }

            return config;
        }
        
        private void LocalizeSettingsObject(JObject jObject)
        {
            var properties = jObject.Descendants()
                .OfType<JProperty>()
                .Where(property =>
                {
                    if (property.Value.Type != JTokenType.String)
                        return false;
                    
                    var value = (string)property.Value;
                    
                    return !string.IsNullOrEmpty(value) 
                           && value.StartsWith("Landings.Views.Blocks.Config.");
                });
    
            foreach (var property in properties)
                property.Value = LocalizationService.GetResource((string)property.Value);
        }
    }
}
