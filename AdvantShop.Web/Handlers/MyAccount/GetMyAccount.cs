using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Crm.BusinessProcesses;
using AdvantShop.Core.Services.Crm.BusinessProcesses.Customers;
using AdvantShop.Core.Services.MyAccount;
using AdvantShop.Core.Services.Triggers;
using AdvantShop.Customers;
using AdvantShop.ViewModel.MyAccount;

namespace AdvantShop.Handlers.MyAccount
{
    public class GetMyAccount
    {
        private readonly Customer _customer;
        private readonly object _isRegisteredNow;

        public GetMyAccount(Customer customer, object isRegisteredNow)
        {
            _customer = customer;
            _isRegisteredNow = isRegisteredNow;
        }

        public MyAccountViewModel Execute()
        {
            var model = new MyAccountViewModel()
            {
                DisplayBonuses = BonusSystem.IsActive && BonusSystem.ImplementICardService,
                DisplayChangeEmail = _customer.EMail.Contains("@temp"),
                DisplayBringFriend = BonusSystem.IsInternal && InternalBonusSystem.BringFriendIsEnabled,
                Tabs = new List<MyAccountTab>(),
                IsRegisteredNow = _isRegisteredNow != null
            };

            if (model.DisplayBonuses)
            {
                var bonusCard = BonusSystem.GetCard(_customer);
                if (bonusCard != null)
                    model.BonusesAmount = bonusCard.Bonuses.HasValue ? bonusCard.Bonuses.Value.SimpleRoundPrice().FormatBonuses() : string.Empty;
            }
            
            var modules = AttachedModules.GetModuleInstances<IMyAccountTabs>();
            if (modules != null && modules.Count != 0)
            {
                foreach (var module in modules)
                    model.Tabs.AddRange(module.GetMyAccountTabs());
            }

            if (model.Tabs.Any(x => string.Equals(x.TabName, "bonusTab", StringComparison.OrdinalIgnoreCase)))
                model.DisplayBonuses = false;

            return model;
        }
    }
}