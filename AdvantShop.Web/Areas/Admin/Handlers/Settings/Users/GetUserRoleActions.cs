using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Models.Settings.Users;

namespace AdvantShop.Web.Admin.Handlers.Settings.Users
{
    public class GetUserRoleActions
    {
        private readonly Guid? _customerId;

        public GetUserRoleActions(Guid? customerId)
        {
            _customerId = customerId;
        }

        public List<UserRoleActionModel> Execute()
        {
            var model = new List<UserRoleActionModel>();

            var customerRoleActions = _customerId.HasValue
                ? RoleActionService.GetRoleActionsByCustomerId(_customerId.Value)
                : new List<RoleAction>();
            
            var customerRoleActionsKeys = _customerId.HasValue
                ? RoleActionService.GetRoleActionsKeysByCustomerId(_customerId.Value)
                : new List<string>();

            var customer = _customerId.HasValue ? CustomerService.GetCustomer(_customerId.Value) : null;

            foreach (RoleAction roleAction in Enum.GetValues(typeof(RoleAction)))
            {
                if (roleAction == RoleAction.None)
                    continue;

                model.Add(new UserRoleActionModel
                {
                    Key = roleAction.ToString(),
                    Name = roleAction.Localize(),
                    Enabled = _customerId.HasValue && ((customer != null && customer.IsAdmin) || customerRoleActions.Any(x => x == roleAction)),
                    Parent = SearchParent(roleAction),
                    AccessSettingsGroup = GetAccessSettingsGroup(roleAction)?.ToString()
                });
            }

            var modules = ModulesService.GetModules().Items.Where(x => x.IsInstall).ToList();

            foreach (var module in modules)
            {
                model.Add(new UserRoleActionModel
                {
                    Key = module.StringId,
                    Name = module.Name,
                    Enabled = _customerId.HasValue && ((customer != null && customer.IsAdmin) || customerRoleActionsKeys.Any(x => x == module.StringId)),
                    Parent = RoleAction.Modules.ToString(),
                    AccessSettingsGroup = AccessSettingsGroup.Modules.ToString()
                });
            }

            return model;
        }
        
        private string SearchParent(RoleAction roleAction)
        {
            var fieldInfo = typeof(RoleAction).GetField(roleAction.ToString());
            if (fieldInfo == null)
                return null;

            var actionGroupAttr = fieldInfo.GetCustomAttribute<ActionGroupAttribute>();
            if (actionGroupAttr == null)
                return null;

            if (!Enum.IsDefined(typeof(RoleAction), actionGroupAttr.ParentAction))
                return null;

            return actionGroupAttr.ParentAction.ToString();
        }
        
        private AccessSettingsGroup? GetAccessSettingsGroup(RoleAction roleAction)
        {
            var fieldInfo = typeof(RoleAction).GetField(roleAction.ToString());
            if (fieldInfo == null)
                return null;

            var accessSettingsGroupAttr = fieldInfo.GetCustomAttribute<AccessSettingsGroupAttribute>();
            return accessSettingsGroupAttr?.AccessSettingsGroup;
        }
    }
}
