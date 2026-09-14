using AdvantShop.Core.Modules;

namespace AdvantShop.Module.SmsConfirmation.Service
{
    public class SmsConfirmationSettings
    {
        public static readonly int Version = 1;

        public static string ModuleID = SmsConfirmation.ModuleStringId;

        public static string PromoHelpEmail
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("PromoHelpEmail", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("PromoHelpEmail", value, ModuleID); }
        }

        public static bool RegistrationPageActive
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RegistrationPageActive", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RegistrationPageActive", value, ModuleID); }
        }

        public static bool AuthorizationPageActive
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("AuthorizationPageActive", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("AuthorizationPageActive", value, ModuleID); }
        }

        public static bool CheckoutPageActive
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("CheckoutPageActive", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("CheckoutPageActive", value, ModuleID); }
        }

        public static string FormContent
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("FormContent", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("FormContent", value, ModuleID); }
        }

        public static string FormTitle
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("FormTitle", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("FormTitle", value, ModuleID); }
        }

        public static bool UseCaptcha
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("UseCaptcha", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("UseCaptcha", value, ModuleID); }
        }


        #region UserEmailCheckoutSettings
        public static bool? IsShowEmailOnCheckout
        {
            get 
            { 
                return ModuleSettingsProvider.IsSqlSettingExist("IsShowEmailOnCheckout", ModuleID) 
                    ? (bool?)ModuleSettingsProvider.GetSettingValue<bool>("IsShowEmailOnCheckout", ModuleID)
                    : null; 
            }
            set { ModuleSettingsProvider.SetSettingValue("IsShowEmailOnCheckout", value, ModuleID); }
        }

        public static bool? RequiredEmailOnCheckout
        {
            get 
            { 
                return ModuleSettingsProvider.IsSqlSettingExist("RequiredEmailOnCheckout", ModuleID)
                    ? (bool?)ModuleSettingsProvider.GetSettingValue<bool>("RequiredEmailOnCheckout", ModuleID)
                    : null; 
            }
            set { ModuleSettingsProvider.SetSettingValue("RequiredEmailOnCheckout", value, ModuleID); }
        }

        public static void RemoveEmailCheckoutSettings()
        {
            ModuleSettingsProvider.RemoveSqlSetting("IsShowEmailOnCheckout", ModuleID);
            ModuleSettingsProvider.RemoveSqlSetting("RequiredEmailOnCheckout", ModuleID);
        }
        #endregion

        public static bool SetDefaultSettings()
        {
            PromoHelpEmail = "help@promo-z.ru";

            if (!ModuleSettingsProvider.IsSqlSettingExist("RegistrationPageActive", ModuleID))
                RegistrationPageActive = true;

            if (!ModuleSettingsProvider.IsSqlSettingExist("AuthorizationActive", ModuleID))
                AuthorizationPageActive = true;

            if (!ModuleSettingsProvider.IsSqlSettingExist("CheckoutActive", ModuleID))
                CheckoutPageActive = true;

            if (!ModuleSettingsProvider.IsSqlSettingExist("FormContent", ModuleID))
                FormContent = string.Empty;

            if (!ModuleSettingsProvider.IsSqlSettingExist("FormTitle", ModuleID))
                FormTitle = string.Empty;

            if (!ModuleSettingsProvider.IsSqlSettingExist("UseCaptcha", ModuleID))
                UseCaptcha = false;

            return true;
        }

        public static bool RemoveSettings()
        {
            ModuleSettingsProvider.RemoveSqlSettings(ModuleID);
            return true;
        }
        
        public static string CrmPromoUrl
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("CrmPromoUrl", ModuleID)?.TrimEnd('/'); }
            set { ModuleSettingsProvider.SetSettingValue("CrmPromoUrl", value, ModuleID); }
        }
    }
}
