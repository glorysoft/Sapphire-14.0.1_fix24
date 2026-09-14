using System.Collections.Generic;
using System.Globalization;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Module.ShippingPaymentPage.Services;

namespace AdvantShop.Module.ShippingPaymentPage
{
    public class ShippingPaymentPage : IModule, IModuleBundles, IAdminModuleSettings
    {
        #region IModule

        public string ModuleStringId
        {
            get { return "ShippingPaymentPage"; }
        }

        public static string ModuleID
        {
            get { return "ShippingPaymentPage"; }
        }

        public string ModuleName
        {
            get { return "Калькулятор Доставки/Оплаты"; }
        }

        public bool CheckAlive()
        {
            return ModulesRepository.IsInstallModule(ModuleStringId);
        }

        public bool InstallModule()
        {
            return ShippingPaymentPageRepository.InstallModule();
        }

        public bool UpdateModule()
        {
            return ShippingPaymentPageRepository.UpdateModule();
        }

        public bool UninstallModule()
        {
            return ShippingPaymentPageRepository.UninstallModule();
        }

        #endregion

        #region IModuleBundles

        public List<string> GetCssBundles()
        {
            return new List<string>() { "~/modules/shippingpaymentpage/styles/shipping-payment.css" };
        }

        public List<string> GetJsBundles()
        {
            return null;
        }

        #endregion

        #region IAdminModuleSettings

        public bool IsMobileAdminReady => true;

        public List<ModuleSettingTab> AdminSettings
        {
            get
            {
                return new List<ModuleSettingTab>()
                {
                    new ModuleSettingTab()
                    {
                        Title = CultureInfo.CurrentCulture.TwoLetterISOLanguageName == "ru" ? "Калькулятор доставки/оплаты" : "ShippingPaymentPage",
                        Controller = "ShippingPaymentPageAdmin",
                        Action = "Settings",
                        IsAdaptive = true
                    }
                };
            }
        }

        #endregion
    }
}
