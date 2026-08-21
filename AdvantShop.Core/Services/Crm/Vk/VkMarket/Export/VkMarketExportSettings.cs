using System;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Scheduler;

namespace AdvantShop.Core.Services.Crm.Vk.VkMarket.Export
{
    public enum ShowDescriptionMode
    {
        No = 0,
        Full = 1,
        Short = 2
    }

    /// <summary>
    /// Как выгружать товары в Вк
    /// </summary>
    public enum VkExportMode
    {
        /// <summary>
        /// Выгружать оферы и группировать их в 1 товар
        /// </summary>
        GrouppingOffers = 0,

        /// <summary>
        /// Выгружать товары, оферы выводятся как текст в описании
        /// </summary>
        ProductWithouOffers
    }

    public enum VkExportAmount
    {
        Yes = 0,
        No = 1
    }


    public class VkMarketExportSettings
    {
        public static bool ExportUnavailableProducts
        {
            get => SettingProvider.Items["ExportUnavailableProducts"].TryParseBool();
            set => SettingProvider.Items["ExportUnavailableProducts"] = value.ToString();
        }

        public static bool ExportPreorderProducts
        {
            get => SettingProvider.Items["VkMarket.ExportPreorderProducts"].TryParseBool(isNullable: true) ?? true;
            set => SettingProvider.Items["VkMarket.ExportPreorderProducts"] = value.ToString();
        }

        public static bool AddSizeAndColorInName
        {
            get => SettingProvider.Items["AddSizeAndColorInName"].TryParseBool();
            set => SettingProvider.Items["AddSizeAndColorInName"] = value.ToString();
        }

        public static bool AddSizeAndColorInDescription
        {
            get => SettingProvider.Items["AddSizeAndColorInDescription"].TryParseBool();
            set => SettingProvider.Items["AddSizeAndColorInDescription"] = value.ToString();
        }

        public static ShowDescriptionMode ShowDescription
        {
            get => !string.IsNullOrEmpty(SettingProvider.Items["ShowDescription"])
                        ? (ShowDescriptionMode)SettingProvider.Items["ShowDescription"].TryParseInt()
                        : ShowDescriptionMode.Short;
            set => SettingProvider.Items["ShowDescription"] = ((int)value).ToString();
        }
        
        public static bool ExportOnShedule
        {
            get => SettingProvider.Items["ExportOnShedule"].TryParseBool();
            set
            {
                SettingProvider.Items["ExportOnShedule"] = value.ToString();
                JobActivationManager.SettingUpdated();
            }
        }

        public static bool ShowProperties
        {
            get => string.IsNullOrEmpty(SettingProvider.Items["ShowProperties"]) || SettingProvider.Items["ShowProperties"].TryParseBool();
            set => SettingProvider.Items["ShowProperties"] = value.ToString();
        }

        public static bool ConsiderMinimalAmount
        {
            get => string.IsNullOrEmpty(SettingProvider.Items["ShowProperties"]) || SettingProvider.Items["ConsiderMinimalAmount"].TryParseBool();
            set => SettingProvider.Items["ConsiderMinimalAmount"] = value.ToString();
        }

        public static VkExportMode ExportMode
        {
            get => (VkExportMode)SettingProvider.Items["ExportMode"].TryParseInt();
            set => SettingProvider.Items["ExportMode"] = ((int)value).ToString();
        }
        
        public static VkExportAmount ExportAmount
        {
            get => (VkExportAmount)SettingProvider.Items["ExportAmount"].TryParseInt();
            set => SettingProvider.Items["ExportAmount"] = ((int)value).ToString();
        }
        
        public static bool ExportProductUrl
        {
            get => Convert.ToBoolean(SettingProvider.Items["ExportProductUrl"]);
            set => SettingProvider.Items["ExportProductUrl"] = value.ToString();
        }
    }
}
