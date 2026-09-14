using AdvantShop.Core.Modules;

namespace AdvantShop.Module.ShippingPaymentPage.Services
{
    public class ShippingPaymentPageSettings
    {
        public static float DefaultWeight
        {
            get { return ModuleSettingsProvider.GetSettingValue<float>("DefaultWeight", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("DefaultWeight", value, ShippingPaymentPage.ModuleID); }
        }
        public static float DefaultWidth
        {
            get { return ModuleSettingsProvider.GetSettingValue<float>("DefaultWidth", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("DefaultWidth", value, ShippingPaymentPage.ModuleID); }
        }
        public static float DefaultHeight
        {
            get { return ModuleSettingsProvider.GetSettingValue<float>("DefaultHeight", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("DefaultHeight", value, ShippingPaymentPage.ModuleID); }
        }
        public static float DefaultLength
        {
            get { return ModuleSettingsProvider.GetSettingValue<float>("DefaultLength", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("DefaultLength", value, ShippingPaymentPage.ModuleID); }
        }
        public static float DefaultPrice
        {
            get { return ModuleSettingsProvider.GetSettingValue<float>("DefaultPrice", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("DefaultPrice", value, ShippingPaymentPage.ModuleID); }
        }
        public static float DefaultShippingPrice
        {
            get { return ModuleSettingsProvider.GetSettingValue<float>("DefaultShippingPrice", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("DefaultShippingPrice", value, ShippingPaymentPage.ModuleID); }
        }
        public static string ShippingTextBlock
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("ShippingTextBlock", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("ShippingTextBlock", value, ShippingPaymentPage.ModuleID); }
        }
        public static string ShippingTextBlockBottom
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("ShippingTextBlockBottom", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("ShippingTextBlockBottom", value, ShippingPaymentPage.ModuleID); }
        }
        public static string Title
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("Title", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("Title", value, ShippingPaymentPage.ModuleID); }
        }
        public static string MetaDescription
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("MetaDescription", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("MetaDescription", value, ShippingPaymentPage.ModuleID); }
        }
        public static string MetaKeywords
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("MetaKeywords", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("MetaKeywords", value, ShippingPaymentPage.ModuleID); }
        }
        public static string DefaultPriceCurrencyIso3
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("DefaultPriceCurrencyIso3", ShippingPaymentPage.ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("DefaultPriceCurrencyIso3", value, ShippingPaymentPage.ModuleID); }
        }
    }
}
