using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.MyAccount;
using AdvantShop.Module.SmsConfirmation.Service;
using AdvantShop.Orders;
using System.Collections.Generic;
using System.Globalization;

namespace AdvantShop.Module.SmsConfirmation
{
    public class SmsConfirmation : IModule, IAdminModuleSettings,  IModuleBundles, IRenderModuleByKey, 
        IMyAccountTabs, IOrderChanged, IModuleChangeActive
    {
        #region IModule

        public static string ModuleName => CultureInfo.CurrentCulture.TwoLetterISOLanguageName == "ru" ? "СМС-авторизация" : "SMS-autorization";

        string IModule.ModuleName => ModuleName;

        public static string ModuleStringId => "SmsConfirmation";

        string IModule.ModuleStringId => ModuleStringId;

        public bool CheckAlive() => true;

        public bool InstallModule() => SmsConfirmationService.Install();

        public bool UninstallModule() 
        {
            //Восстанавливаем настройки поля "Email" на странице оформления заказа такими, какие они были до активации модуля
            SmsConfirmationService.SetUserEmailCheckoutSettings(isShowEmailOnCheckout: SmsConfirmationSettings.IsShowEmailOnCheckout, requiredEmailOnCheckout: SmsConfirmationSettings.RequiredEmailOnCheckout);
            SmsConfirmationSettings.RemoveEmailCheckoutSettings();

            return SmsConfirmationService.UnInstall(); 
        }

        public bool UpdateModule() { return SmsConfirmationService.Update(); }
        #endregion

        #region IAdminModuleSettings
        public bool IsMobileAdminReady => false;
        public List<ModuleSettingTab> AdminSettings =>
            new List<ModuleSettingTab>
            {
                new ModuleSettingTab
                {
                    Title = "Настройки",
                    Controller = "SmsConfirmationAdmin",
                    Action = "ModuleSettings"
                }
            };

        #endregion

        #region IModuleBundles
        public List<string> GetCssBundles()
        {
            return new List<string>
            {
                "~/modules/" + ModuleStringId + "/content/styles/client-style.css?" + Service.SmsConfirmationSettings.Version
            };
        }

        public List<string> GetJsBundles()
        {
            return new List<string>
            {
                "~/modules/" + ModuleStringId + "/content/scripts/client-script.js?" + Service.SmsConfirmationSettings.Version
            };
        }
        #endregion

        #region IRenderModuleByKey
        public List<ModuleRoute> GetModuleRoutes()
        {
            return new List<ModuleRoute>
            {
                new ModuleRoute
                {
                    Key = "body_end",
                    ControllerName = "SmsConfirmationClient",
                    ActionName = "RenderSmsConfirmation"
                },
                new ModuleRoute
                {
                    Key = "mobile_body_end",
                    ControllerName = "SmsConfirmationClient",
                    ActionName = "RenderSmsConfirmation"
                }
            };
        }
        #endregion

        #region IMyAccountTabs
        public IList<MyAccountTab> GetMyAccountTabs()
        {
            return Service.SmsConfirmationService.GetMyAccountChangeEmailTabs();
        }
        #endregion

        #region IOrderChanged
        public void DoOrderAdded(IOrder order)
        {
            Service.SmsConfirmationService.CheckOrderCustomer(order);
        }

        public void DoOrderChangeStatus(IOrder order)
        {
        }

        public void DoOrderUpdated(IOrder order)
        {
        }

        public void DoOrderDeleted(int orderId)
        {
        }

        public void PayOrder(int orderId, bool payed)
        {
        }

        public void UpdateComments(int orderId)
        {
        }

        public void DoOrderItemAdded(IOrderItem item)
        {
        }

        public void DoOrderItemUpdated(IOrderItem item)
        {
        }

        public void DoOrderItemDeleted(IOrderItem item)
        {
        }

        #endregion

        #region IModuleChangeActive
        public void ModuleChangeActive(bool active)
        {
            if (active)
            { 
                SmsConfirmationService.SaveUserEmailCheckoutSettings(); // Сохраняем настройки "Email" на странице оформления заказа
                SmsConfirmationService.SetUserEmailCheckoutSettings(isShowEmailOnCheckout: false, requiredEmailOnCheckout: false); // Отключаем отображение поля "Email" на странице оформления заказа
            }
            else
            {
                //Восстанавливаем настройки поля "Email" на странице оформления заказа такими, какие они были до активации модуля
                SmsConfirmationService.SetUserEmailCheckoutSettings(isShowEmailOnCheckout: SmsConfirmationSettings.IsShowEmailOnCheckout, requiredEmailOnCheckout: SmsConfirmationSettings.RequiredEmailOnCheckout);
                SmsConfirmationSettings.RemoveEmailCheckoutSettings();
            } 
        }
        #endregion
    }
}
