using System;
using System.Collections.Generic;
using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Models.User;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class InitPhoneConfirmationHandler : ICommandHandler<InitPhoneConfirmationModel>
    {
        public InitPhoneConfirmationModel Execute()
        {
            var modulesControllerNames = new List<string>();

            foreach (var moduleType in AttachedModules.GetModules<IModulePhoneConfirmation>())
            {
                var module = (IModulePhoneConfirmation)Activator.CreateInstance(moduleType, null);

                if (module.PhoneConfirmationEnabled())
                    modulesControllerNames.Add(module.PhoneConfirmationControllerName());
            }
            
            return new InitPhoneConfirmationModel
            {
                ModulesControllerNames = modulesControllerNames,
                ShowCodeConfirmation = (SettingsCheckout.IsShowPhone || BonusSystem.IsActive) 
                                       && SettingsAuth.AuthByCodeActive 
                                       && SettingsAuth.UsePhoneConfirmation,
            };
        }
    }
}