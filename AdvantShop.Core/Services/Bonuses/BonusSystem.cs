using System;
using System.Linq;
using System.Web;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Customers;
using AdvantShop.Orders;
using AdvantShop.Saas;

namespace AdvantShop.Core.Services.Bonuses
{
    public partial class BonusSystem
    {
        // Общее взаимодействие с бонусной и с IBonusSystem

        public static bool IsActive
        {
            get
            {
                var context = HttpContext.Current;
                if (context != null && context.Items["ActiveBonusSystem"] != null)
                    return Convert.ToBoolean(HttpContext.Current.Items["ActiveBonusSystem"]);

                var isActive = 
                    SettingsMain.BonusAppActive &&
                    (!SaasDataService.IsSaasEnabled || SaasDataService.CurrentSaasData.BonusSystem);
                
                isActive &= _getBonusSystem()?.IsActive ?? false;

                if (context != null)
                    context.Items["ActiveBonusSystem"] = isActive;

                return isActive;
            }
        }
        
        public static string CurrentBonusSystemKey => SettingsMain.ActiveBonusSystemModule ?? string.Empty;

        public static bool IsInternal => CurrentBonusSystemKey.IsNullOrEmpty();
        
        private static IBonusSystem GetActiveBonusSystemModule()
        {
            if (IsInternal)
                return null;

            return AttachedModules
                  .GetModules<IBonusSystemModule>()
                  .Select(x => (IBonusSystemModule) Activator.CreateInstance(x))
                  .FirstOrDefault(x => x.ModuleStringId == CurrentBonusSystemKey)
                 ?.GetBonusSystem();
        }
        
        private static IBonusSystem _getBonusSystem() => IsInternal ? new FacadeIBonusSystem() : GetActiveBonusSystemModule();
        // public static IBonusSystem GetBonusSystem() => IsActive ? _getBonusSystem() : null;
        
         
        public static float GetApplyBonuses(Order order, float? newUsedBonuses = null)
        {
            if (!IsActive)
                return 0f;
            
            var customer = CustomerService.GetCustomer(order.OrderCustomer.CustomerID);
            var purchase = Purchase.CreateBy(order);
            purchase.UsedBonuses = newUsedBonuses;
            return _getBonusSystem()?.GetApplyBonuses(purchase, customer) ?? 0f;
        }
        
        public static float GetApplyBonuses(ShoppingCart shoppingCart, float shippingCost, float paymentFeeOrDiscount, float? usedBonuses)
        {
            if (!IsActive)
                return 0f;
            
            var customer = shoppingCart.Customer;
            return _getBonusSystem()?.GetApplyBonuses(Purchase.CreateBy(shoppingCart, shippingCost, paymentFeeOrDiscount, usedBonuses), customer) ?? 0f;
        }
        
        public static float GetAccrueBonuses(Order order)
        {
            if (!IsActive)
                return 0f;
            
            var customer = CustomerService.GetCustomer(order.OrderCustomer.CustomerID);
            return _getBonusSystem()?.GetAccrueBonuses(Purchase.CreateBy(order), customer) ?? 0f;
        }
        
        public static float GetAccrueBonuses(ShoppingCart shoppingCart, float shippingCost, float paymentFeeOrDiscount, float? usedBonuses)
        {
            if (!IsActive)
                return 0f;
            
            var customer = shoppingCart.Customer;
            return _getBonusSystem()?.GetAccrueBonuses(Purchase.CreateBy(shoppingCart, shippingCost, paymentFeeOrDiscount, usedBonuses), customer) ?? 0f;
        }
        
        public static (float? AccrueBonuses, bool? IsAccrued) GetAccrueBonusesByOrder(string orderNumber)
        {
            if (!IsActive)
                return default;
            
            return _getBonusSystem()?.GetAccrueBonuses(orderNumber) ?? default;
        }
        
        // для не стандартных кейсов
        public static float GetAccrueBonuses(Purchase purchase, Customer customer)
        {
            if (!IsActive)
                return 0f;

            return _getBonusSystem()?.GetAccrueBonuses(purchase, customer) ?? 0f;
        }

        public static void OnPurchase(Order order)
        {
            if (!IsActive) 
                return;
            
            var customer = CustomerService.GetCustomer(order.OrderCustomer.CustomerID);
            _getBonusSystem()?.OnPurchase(Purchase.CreateBy(order), customer);
        }

        public static void OnChangePurchase(Order order)
        {
            if (!IsActive) 
                return;
            
            _getBonusSystem()?.OnChangePurchase(Purchase.CreateBy(order));
        }

        public static bool ConfirmPurchase(Order order)
        {
            if (!IsActive) 
                return false;
            
            return _getBonusSystem()?.ConfirmPurchase(Purchase.CreateBy(order)) ?? false;
        }

        public static bool UnConfirmPurchase(Order order)
        {
            if (!IsActive) 
                return false;
            
            return _getBonusSystem()?.UnConfirmPurchase(Purchase.CreateBy(order)) ?? false;
        }

        public static bool RollbackPurchase(Order order)
        {
            if (!IsActive) 
                return false;
            
            return _getBonusSystem()?.RollbackPurchase(Purchase.CreateBy(order)) ?? false;
        }

        public static bool RestorePurchase(Order order)
        {
            if (!IsActive) 
                return false;
            
            return _getBonusSystem()?.RestorePurchase(Purchase.CreateBy(order)) ?? false;
        }

        public static bool CanChangeApplyBonuses(Order order)
        {
            if (!IsActive)
                return false;

            return !order.Payed 
                   && (_getBonusSystem()?.CanChangeApplyBonuses(order.Number) ?? false);
        }

        public static void OnDeletePurchase(Order order)
        {
            if (!IsActive) 
                return;
            
            _getBonusSystem()?.OnDeletePurchase(Purchase.CreateBy(order));
        }
    }
}