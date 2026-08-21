using System;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;

namespace AdvantShop.Core.Services.Auth
{
    public static class ModulesPhoneConfirmationService
    {
        public static bool IsExistsPhoneConfirmedModules()
        {
            foreach (var moduleType in AttachedModules.GetModules<IModulePhoneConfirmation>())
            {
                var module = (IModulePhoneConfirmation)Activator.CreateInstance(moduleType, null);

                if (module.PhoneConfirmationEnabled())
                    return true;
            } 
            
            return false;
        }
        
        public static bool IsPhoneConfirmed(long phone, Guid customerId)
        {
            foreach (var moduleType in AttachedModules.GetModules<IModulePhoneConfirmation>())
            {
                var module = (IModulePhoneConfirmation)Activator.CreateInstance(moduleType, null);

                if (module.PhoneConfirmationEnabled() && module.IsConfirmed(customerId, phone))
                    return true;
            }

            return false;
        }
    }
}