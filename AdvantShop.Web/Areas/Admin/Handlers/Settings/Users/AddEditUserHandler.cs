using System;
using System.Linq;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Customers;
using AdvantShop.Core.Services.Mails;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Mails;
using AdvantShop.Saas;
using AdvantShop.Web.Admin.Handlers.Shared.Common;
using AdvantShop.Web.Admin.Models.Settings.Users;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.Users
{
    public class AddEditUserHandler : AbstractCommandHandler<object>
    {
        private readonly AdminUserModel _model;
        private readonly bool _editMode;
        private readonly Customer _currentCustomer;
        private readonly bool _roleActionsForbidden;
        private readonly bool _canChangeYourself;

        private Customer _customer;

        public AddEditUserHandler(AdminUserModel model, bool editMode)
        {
            _model = model;
            _editMode = editMode;
            _roleActionsForbidden = SaasDataService.IsSaasEnabled && !SaasDataService.CurrentSaasData.RoleActions;
            _currentCustomer = CustomerContext.CurrentCustomer;
            _canChangeYourself = false;
        }
        
        public AddEditUserHandler(AdminUserModel model, bool editMode, bool canChangeYourself) : this(model, editMode)
        {
            _canChangeYourself = canChangeYourself;
        }

        protected override void Load()
        {
            _customer = _editMode 
                ? CustomerService.GetCustomer(_model.CustomerId) 
                : CustomerService.GetCustomerByEmail(_model.Email);
        }

        protected override void Validate()
        {
            if (_editMode && _customer == null)
                throw new BlException(T("Admin.Users.Validate.NotFound"));

            if (!_editMode && (SaasDataService.IsSaasEnabled && ManagerService.GetManagersCount() >= SaasDataService.CurrentSaasData.EmployeesCount))
                throw new BlException("Достигнуто максимальное количество сотрудников, доступных на Вашем тарифном плане");

            if (!_canChangeYourself 
                && _model.CustomerId == _currentCustomer.Id
                && !CustomerContext.CurrentCustomer.IsAdmin)
                throw new BlException(T("Admin.Users.Validate.AccessDenied"));

            if (_model.CustomerRole == Role.Moderator && _roleActionsForbidden)
                throw new BlException(T("Admin.Users.Validate.AccessRightsNotInTariff"));
            if (_model.CustomerRole == Role.Administrator && _currentCustomer.IsModerator)
                throw new BlException(T("Admin.Users.Validate.NoAccessToCreateAdmin"));
            if (_model.CustomerRole != Role.Administrator && _model.CustomerRole != Role.Moderator)
                throw new BlException(T("Admin.Users.Validate.SetAccessRights"));

            if (_model.Email.IsNullOrEmpty() || _model.FirstName.IsNullOrEmpty() || _model.LastName.IsNullOrEmpty())
                throw new BlException(T("Admin.Users.Validate.EnterData"));

            if (!ValidationHelper.IsValidEmail(_model.Email) && !string.Equals(_model.Email, "admin"))
                throw new BlException(T("Admin.Users.Validate.WrongEmail"));

            if ((_editMode && _customer.EMail != _model.Email && CustomerService.ExistsEmail(_model.Email)) ||
                (!_editMode && _customer != null && (_customer.IsAdmin || _customer.IsModerator)))
                throw new BlException(T("Admin.Users.Validate.EmailIsBusy"));
        }

        protected override object Handle()
        {
            var addingNew = _customer == null;

            if (addingNew)
            {
                _customer = new Customer
                {
                    Id = _model.CustomerId,
                    Password = StringHelper.GeneratePassword(8)
                };
            }

            _customer.CustomerGroupId = CustomerGroupService.DefaultCustomerGroup;
            _customer.CustomerRole = _model.CustomerRole;
            _customer.EMail = _model.Email;
            _customer.FirstName = _model.FirstName.DefaultOrEmpty().Trim();
            _customer.LastName = _model.LastName.DefaultOrEmpty().Trim();
            _customer.Phone = _model.Phone.DefaultOrEmpty().Trim();
            _customer.StandardPhone = StringHelper.ConvertToStandardPhone(_model.Phone, true, true);
            _customer.Enabled = _model.Enabled;
            _customer.HeadCustomerId = _model.HeadCustomerId;
            _customer.BirthDay = _model.BirthDay;
            _customer.City = _model.City;
            
            var twoFactorModules = AttachedModules.GetModules<ITwoFactorAuthentication>();
            if (twoFactorModules != null && twoFactorModules.Count > 0)
            {
                var moduleInstance = (ITwoFactorAuthentication)Activator.CreateInstance(twoFactorModules[0], null);
                if (_model.TwoFactorAuthEnabled != moduleInstance.HasUserEnabledAuthentication(_model.CustomerId))
                {
                    if (!_model.TwoFactorAuthEnabled || moduleInstance.CheckCodeValid(_model.TwoFactorSecretKey, _model.TwoFactorAuthCode))
                        moduleInstance.SaveUserAuthenticationEnabled(_model.CustomerId, _model.TwoFactorAuthEnabled, _model.TwoFactorSecretKey, _model.TwoFactorQrCode);
                    else
                        throw new BlException(T("Admin.Users.Validate.InvalidAuthCode"));
                }
            }

            if (addingNew)
            {
                if (!CustomerService.IsNewCustomerValid(_customer))
                    throw new BlException(T("Admin.Users.Validate.EmailOrPhoneExists"));

                CustomerService.InsertNewCustomer(_customer);
                Track.TrackService.TrackEvent(Track.ETrackEvent.Core_Settings_EmployeeCreated);
            }
            else
            {
                CustomerService.UpdateCustomer(_customer);
                Track.TrackService.TrackEvent(Track.ETrackEvent.Core_Settings_EmployeeEdited);
            }

            if (_model.CustomerId != _currentCustomer.Id 
                && _customer.CustomerRole == Role.Moderator 
                && _currentCustomer.HasRoleAction(RoleAction.Settings))
            {
                RoleActionService.DeleteCustomerRoleActions(_customer.Id);

                foreach (var customerRoleAction in _model.RoleActionKeys.Where(action => action.Enabled))
                    RoleActionService.UpdateOrInsertCustomerRoleAction(
                        _customer.Id, 
                        customerRoleAction.Key, 
                        true);
            }

            var manager = new Manager
            {
                CustomerId = _customer.Id,
                DepartmentId = _model.DepartmentId,
                Position = _model.Position,
                Sign = _model.Sign
            };
            ManagerService.AddOrUpdateManager(manager);

            if (_model.PhotoEncoded.IsNotEmpty())
                new UploadAvatarCropped(_customer, _model.Avatar, _model.PhotoEncoded).Execute();

            if (_model.CustomerId != _currentCustomer.Id)
            {
                ManagerRoleService.DeleteMap(_customer.Id);
                
                foreach (var roleId in _model.ManagerRolesIds)
                    ManagerRoleService.AddMap(_customer.Id, roleId);
            }

            if (_model.CustomerFields != null)
            {
                foreach (var field in _model.CustomerFields)
                    CustomerFieldService.AddUpdateMap(_customer.Id, field.Id, field.Value ?? "");
            }

            if (_model.CustomerId != _currentCustomer.Id 
                && manager.ManagerId != 0 
                && _customer.CustomerRole == Role.Moderator)
            {
                if (!addingNew)
                    ManagerService.DeleteAllWarehousesAssignedToManager(manager.ManagerId);

                if (_model.WarehouseIdsAssignedToManager != null && _model.WarehouseIdsAssignedToManager.Count > 0)
                {
                    foreach (var warehouseId in _model.WarehouseIdsAssignedToManager)
                        ManagerService.AssignWarehouseToManager(manager.ManagerId, warehouseId);
                }
            }

            if (addingNew && _customer.Enabled)
            {
                _customer.Password = SecurityHelper.GetPasswordHash(_customer.Password);

                var mailTemplate = new UserRegisteredMailTemplate(_customer.EMail, _customer.FirstName, _customer.LastName, Localization.Culture.ConvertDate(DateTime.Now),
                        ValidationHelper.DeleteSigns(SecurityHelper.GetPasswordHash(_customer.Password)));
                
                MailService.SendMailNow(_customer.Id, _customer.EMail, mailTemplate);
            }

            CustomerAdminPushNotificationService.SetNotificationsEnabled(_customer.Id, _model.AdminAppNotificationsEnabled);
            
            return new
            {
                customer = _customer,
                reloadPage = _editMode && _customer.Id == _currentCustomer.Id
            };
        }
    }
}
