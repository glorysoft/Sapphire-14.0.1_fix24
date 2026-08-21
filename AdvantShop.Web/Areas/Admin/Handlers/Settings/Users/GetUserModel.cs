using System;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Customers;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Models.Settings.Users;

namespace AdvantShop.Web.Admin.Handlers.Settings.Users
{
    public class GetUserModel
    {
        private readonly Customer _customer;

        public GetUserModel(Customer customer)
        {
            _customer = customer;
        }

        public AdminUserModel Execute()
        {
            var model = new AdminUserModel
            {
                CustomerId = _customer.Id,
                CustomerRole = _customer.CustomerRole,
                Email = _customer.EMail,
                FirstName = _customer.FirstName,
                LastName = _customer.LastName,
                Phone = _customer.Phone,
                Avatar = _customer.Avatar,
                Enabled = _customer.Enabled,
                HeadCustomerId = _customer.HeadCustomerId,
                BirthDay = _customer.BirthDay,
                City = _customer.City,
                EditHimself = CustomerContext.CustomerId == _customer.Id
            };
            var associatedManager = ManagerService.GetManager(_customer.Id);
            if (associatedManager != null)
            {
                model.AssociatedManagerId = associatedManager.ManagerId;
                model.DepartmentId = associatedManager.DepartmentId;
                if (model.DepartmentId.HasValue)
                {
                    var department = DepartmentService.GetDepartment(model.DepartmentId.Value);
                    model.DepartmentName = department != null ? department.Name : string.Empty;
                }
                model.Position = associatedManager.Position;
                model.Sign = associatedManager.Sign;
            }

            var (fcmToken, notificationEnabled) = CustomerAdminPushNotificationService.GetNotificationSettings(_customer.Id);
            model.FcmToken = fcmToken;
            model.AdminAppNotificationsEnabled = notificationEnabled;
            var twoFactorModules = AttachedModules.GetModules<ITwoFactorAuthentication>();
            model.TwoFactorAuthEnabled = twoFactorModules != null && twoFactorModules.Count > 0 &&
                ((ITwoFactorAuthentication)Activator.CreateInstance(twoFactorModules[0], null)).HasUserEnabledAuthentication(_customer.Id);

            return model;
        }
    }
}
