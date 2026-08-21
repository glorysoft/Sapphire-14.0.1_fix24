using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Orders;

namespace AdvantShop.Customers
{
    public static class CustomerExtensions
    {
        public static string GetFullName(this Customer customer)
        {
            return new List<string>
            {
                customer.LastName,
                customer.FirstName,
                customer.Patronymic
            }.Where(x => x.IsNotEmpty()).Distinct().AggregateString(" ");
        }

        public static string GetShortName(this Customer customer)
        {
            var result = "";
            result += customer.LastName;

            if (!string.IsNullOrEmpty(customer.FirstName) && customer.FirstName != customer.LastName)
                result += (result != "" ? " " : "") + customer.FirstName;
            
            return result;
        }

        public static string GetFullName(this OrderCustomer customer)
        {
            return new List<string>
            {
                customer.LastName,
                customer.FirstName,
                customer.Patronymic
            }.Where(x => x.IsNotEmpty()).Distinct().AggregateString(" ");
        }

        /// <summary>
        /// Является сотрудником с назначенными ему складами?
        /// </summary>
        public static bool IsEmployeeWithAssignedWarehouses(this Customer customer, out List<int> warehouseIds)
        {
            warehouseIds = null;
            
            var isEmployee = customer.IsModerator;
            if (!isEmployee)
                return false;

            warehouseIds = ManagerService.GetWarehouseIdsAssignedToManager(customer.Id);

            return warehouseIds.Count > 0;
        }
    }
}
