using System;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Scheduler;
using AdvantShop.Core.Scheduler.Jobs;
using AdvantShop.Core.Services.SalesChannels;

namespace AdvantShop.Configuration
{
    public enum EFeature
    {
        //[Localize("Новый дашборд")]
        //[DescriptionKey("Показывать \"Мои сайты\" и новый дашбоард")]
        //NewDashboard,

        [Localize("Core.Settings.SettingsFeatures.ImagesInAdditionalOptions")]
        [DescriptionKey("Core.Settings.SettingsFeatures.ImagesInAdditionalOptionsDescription")]
        CustomOptionPicture,

        [Localize("Core.Settings.SettingsFeatures.AdvancedSettingsForAdditionalOptions")]
        [DescriptionKey("Core.Settings.SettingsFeatures.AdvancedSettingsForAdditionalOptionsDescription")]
        CustomOptionCombo,

        [Localize("Core.Settings.SettingsFeatures.WarehouseFunctionalityInPriceTypes")]
        [DescriptionKey("Core.Settings.SettingsFeatures.WarehouseFunctionalityInPriceTypesDescription")]
        PriceTypeWithWarehouse,
        
        [Localize("Core.Settings.SettingsFeatures.WarehouseGroups")]
        [DescriptionKey("Core.Settings.SettingsFeatures.WarehouseGroupsDescription")]
        WarehouseGroups,
        
        [Localize("Core.Settings.SettingsFeatures.AdvancedCarouselSettings")]
        [DescriptionKey("Core.Settings.SettingsFeatures.AdvancedCarouselSettingsDescription")]
        AdvancedCarouselSettings,

        [Task(typeof(ConvertImagesJob), 10, TimeIntervalType.Minutes)]
        [Localize("Core.Settings.SettingsFeatures.ImageConvertor")]
        [DescriptionKey("Core.Settings.SettingsFeatures.ImageConvertorDescription")]
        ImageConvertor,
        
        [Task(typeof(CriticalCssJob), 1, TimeIntervalType.Days)]
        [Localize("Core.Settings.SettingsFeatures.CriticalCss")]
        [DescriptionKey("Core.Settings.SettingsFeatures.CriticalCssDescription")]
        CriticalCss,
        
        [Localize("Core.Settings.SettingsFeatures.GsSymbolAutoFix")]
        [DescriptionKey("Core.Settings.SettingsFeatures.GsSymbolAutoFixDescription")]
        GsSymbolAutoFix,
        
        [Localize("Core.Settings.SettingsFeatures.Warmup")]
        [DescriptionKey("Core.Settings.SettingsFeatures.WarmupDescription")]
        Warmup,
    }

    public class FeaturesService
    {
        public static bool IsEnabled(EFeature feature)
        {
            return SettingsFeatures.EnableExperimentalFeatures && SettingsFeatures.IsFeatureEnabled(feature);
        }
    }

    public class SettingsFeatures
    {
        public static bool EnableExperimentalFeatures
        {
            get => Convert.ToBoolean(SettingProvider.Items["Features.EnableExperimentalFeatures"]);
            set
            {
                SettingProvider.Items["Features.EnableExperimentalFeatures"] = value.ToString();
                CacheManager.RemoveByPattern(SalesChannelService.CacheKey);
            }
        }

        public static bool IsFeatureEnabled(EFeature feature)
        {
            return Convert.ToBoolean(SettingProvider.Items["Features.Enable" + feature.ToString()]);
        }

        public static void SetFeatureEnabled(EFeature feature, bool enabled)
        {
            SettingProvider.Items["Features.Enable" + feature.ToString()] = enabled.ToString();
            
            if (feature.GetAttribute<TaskAttribute>() != null)
                feature.SwitchTask(enabled);
            
            CacheManager.RemoveByPattern(SalesChannelService.CacheKey);
        }
    }
}