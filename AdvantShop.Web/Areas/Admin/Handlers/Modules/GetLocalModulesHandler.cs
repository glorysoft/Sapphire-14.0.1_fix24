using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Modules;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Models.Modules;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Modules
{
    public class GetLocalModulesHandler : ICommandHandler<List<Module>>
    {
        private readonly ModulesFilterModel _filter;

        public GetLocalModulesHandler(ModulesFilterModel filter)
        {
            _filter = filter;
        }
        
        public List<Module> Execute()
        {
            var modules = new ModulesHandler().GetLocalModules(_filter);

            var customer = CustomerContext.CurrentCustomer;
            if (customer.IsAdmin) return modules;
            
            var roleActionsKeys = RoleActionService.GetRoleActionsKeysByCustomerId(customer.Id);

            return modules.Where(module => roleActionsKeys.Contains(module.StringId)).ToList();
        }
    }
}