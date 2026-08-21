using AdvantShop.Configuration;
using AdvantShop.Core.Services.Booking;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Crm;
using AdvantShop.Core.Services.Statistic;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.ViewModels.Shared.Common;

namespace AdvantShop.Web.Admin.Handlers.Shared.Common
{
    public class GetLastStastics
    {
        public LastStatisticsViewModel Execute()
        {
            var model = new LastStatisticsViewModel();

            var currentCustomer = CustomerContext.CurrentCustomer;
            var currentManager = ManagerService.GetManager(currentCustomer.Id);

            if (currentManager != null && SettingsTasks.TasksActive && currentCustomer.HasRoleAction(RoleAction.Tasks))
                model.LastTasksCount = TaskService.GetOpenTasksCount(currentManager.ManagerId);

            // статистика для админа без учета менеджера
            var managerId = currentCustomer.IsAdmin || currentManager == null ? (int?)null : currentManager.ManagerId;

            if (currentCustomer.HasRoleAction(RoleAction.Orders))
            {
                currentCustomer.IsEmployeeWithAssignedWarehouses(out var warehouseIds);
                
                model.LastOrdersCount = StatisticService.GetLastOrdersCount(managerId, warehouseIds: warehouseIds);
            }

            if (SettingsCrm.CrmActive && currentCustomer.HasRoleAction(RoleAction.Crm))
                model.LastLeadsCount = LeadService.GetNewLeadsCount(managerId);
            
            if (SettingsMain.BookingActive && currentCustomer.HasRoleAction(RoleAction.Booking))
                model.LastBookingCount = BookingService.GetLastBookingCount(managerId: managerId);

            model.CongratulationsSteps = (!SettingsCongratulationsDashboard.StoreInfoDone ? 1 : 0) +
                                         (!SettingsCongratulationsDashboard.ProductDone ? 1 : 0) +
                                         (!SettingsCongratulationsDashboard.DesignDone ? 1 : 0) +
                                         (!SettingsCongratulationsDashboard.DomainDone ? 1 : 0);

            return model;
        }
    }
}
