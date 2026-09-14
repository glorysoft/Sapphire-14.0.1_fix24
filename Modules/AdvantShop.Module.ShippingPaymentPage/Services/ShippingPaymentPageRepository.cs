using AdvantShop.Core.Modules;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Repository.Currencies;
using static AdvantShop.Localization.Culture;

namespace AdvantShop.Module.ShippingPaymentPage.Services
{
    public class ShippingPaymentPageRepository
    {
        public static bool UninstallModule()
        {
            return true;
        }

        public static bool InstallModule()
        {
            var language = LanguageService.GetLanguage("ru-RU");
            if (language != null)
            {
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PageTitle", "Доставка и оплата");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.EnterYourCity", "Укажите Ваш город");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.Apply", "Применить");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.RequireCart", "С учетом корзины");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingMethods", "Выберите способ доставки:");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingName", "Наименование");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingCost", "Стоимость");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingTime", "Время доставки");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingDescription", "Описание");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PaymentMethods", "Способы оплаты, доступные при выбранной доставке:");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PaymentName", "Наименование");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PaymentCost", "Стоимость");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingTextBlock", "Текстовый блок над таблицей результатов");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingTextBlockBottom", "Текстовый блок под таблицей результатов");  
            }

            language = LanguageService.GetLanguage("en-US");
            if (language != null)
            {
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PageTitle", "Delivery and payment");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.EnterYourCity", "Enter your city");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.Apply", "Apply");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.RequireCart", "with shopping cart");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingMethods", "Select shipping method:");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingName", "Name");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingCost", "Cost");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingTime", "Time");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingDescription", "Description");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PaymentMethods", "Payment methods, available for selected shipping");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PaymentName", "Name");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PaymentCost", "Cost");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingTextBlock", "Text block");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingTextBlock", "Text block before result table");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingTextBlockBottom", "Text block after result table");               
            }

            return UpdateModule();
        }

        public static bool UpdateModule()
        {
            var language = LanguageService.GetLanguage("ru-RU");
            if (language != null)
            {
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingMethods", "Выберите способ доставки:");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PaymentMethods", "Способы оплаты, доступные при выбранной доставке:");
            }

            language = LanguageService.GetLanguage("en-US");
            if (language != null)
            {
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.ShippingMethods", "Select shipping method:");
                LocalizationService.AddOrUpdateResource(language.LanguageId, "Module.ShippingPaymentPage.PaymentMethods", "Payment methods, available for selected shipping");
            }

            UpdateSettings();
            return true;
        }

        private static void UpdateSettings()
        {
            if (!ModuleSettingsProvider.IsSqlSettingExist("DefaultWeight", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.DefaultWeight = 1;
            if (!ModuleSettingsProvider.IsSqlSettingExist("DefaultWidth", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.DefaultWidth = 10;
            if (!ModuleSettingsProvider.IsSqlSettingExist("DefaultHeight", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.DefaultHeight = 10;
            if (!ModuleSettingsProvider.IsSqlSettingExist("DefaultLength", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.DefaultLength = 10;
            if (!ModuleSettingsProvider.IsSqlSettingExist("DefaultPrice", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.DefaultPrice = 1000;
            if (!ModuleSettingsProvider.IsSqlSettingExist("DefaultShippingPrice", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.DefaultShippingPrice = 0;
            if (!ModuleSettingsProvider.IsSqlSettingExist("ShippingTextBlock", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.ShippingTextBlock = "Text can be changed in admin panel of this module";
            if (!ModuleSettingsProvider.IsSqlSettingExist("ShippingTextBlockBottom", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.ShippingTextBlockBottom = "Text can be changed in admin panel of this module";
            if (!ModuleSettingsProvider.IsSqlSettingExist("DefaultPriceCurrencyIso3", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.DefaultPriceCurrencyIso3 = CurrencyService.CurrentCurrency.Iso3;

            var language = Localization.Culture.Language;
            if (!ModuleSettingsProvider.IsSqlSettingExist("Title", ShippingPaymentPage.ModuleID))
                 ShippingPaymentPageSettings.Title = language == SupportLanguage.Russian ? "Доставка и оплата" : "Delivery and payment";

            if (!ModuleSettingsProvider.IsSqlSettingExist("MetaDescription", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.MetaDescription = language == SupportLanguage.Russian ? "Доставка и оплата" : "Delivery and payment";

            if (!ModuleSettingsProvider.IsSqlSettingExist("MetaKeywords", ShippingPaymentPage.ModuleID))
                ShippingPaymentPageSettings.MetaKeywords = language == SupportLanguage.Russian ? "доставка, оплата" : "delivery, payment";
        }
    }
}
