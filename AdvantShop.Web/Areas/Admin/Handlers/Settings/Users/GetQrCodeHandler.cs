using System;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Customers;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.Users
{
    public class GetQrCodeHandler : ICommandHandler<ITwoFactorAuthenticationOptions>
    {
        private readonly Guid _customerId;
        
        public GetQrCodeHandler(Guid customerId)
        {
            _customerId = customerId;
        }
        
        public ITwoFactorAuthenticationOptions Execute()
        {
            var twoFactorModules = AttachedModules.GetModules<ITwoFactorAuthentication>();
            if (twoFactorModules == null || twoFactorModules.Count == 0) return null;
            var moduleInstance = (ITwoFactorAuthentication)Activator.CreateInstance(twoFactorModules[0], null);
            return moduleInstance.GetCodes(_customerId, CustomerService.GetCustomer(_customerId).EMail);
        }
    }
}