(function (ng) {


    const ModalAddEditUserCtrl = function ($http, $scope, $q, $uibModalInstance, SweetAlert, toaster, $translate, isMobileService) {
        const ctrl = this;
        ctrl.formInited = false;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve != null ? ctrl.$resolve.params || {} : {};
            ctrl.customerId = params.customerId;
            if (ctrl.customerId == 'me') {
                ctrl.mode = 'me';
            } else {
                ctrl.mode = ctrl.customerId != null ? 'edit' : 'add';
            }

            ctrl.getFormData().then(() => {
                if (ctrl.mode == 'add') {
                    ctrl.enabled = true;
                    ctrl.formInited = true;
                    ctrl.customerRole = ctrl.moderatorsAvailable ? '50' : ctrl.isAdmin ? '100' : null;
                    ctrl.adminAppNotificationsEnabled = true;
                } else {
                    ctrl.getUser(ctrl.customerId);
                }
            });
            ctrl.getAccessSettingsGroups();
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getAccessSettingsGroups = function () {
            $http.get('settings/getAccessSettingsGroups').then((response) => {
                ctrl.accessSettingsGroups = response.data;
            });
        };

        ctrl.getUser = function (customerId) {
            const url = ctrl.mode == 'me' ? 'account/getCurrentUser' : 'users/getUser';
            $http.get(url, { params: { customerId, rnd: Math.random() } }).then((response) => {
                if (response.data.result === false) {
                    response.data.errors.forEach((error) => {
                        toaster.error($translate.instant('Admin.Js.Settings.AddEditUserCtrl.Error'), error);
                    });
                    return;
                }
                const data = response.data.obj;
                if (data != null) {
                    ctrl.customerId = data.CustomerId;
                    ctrl.email = data.Email;
                    if (data.CustomerRole == 100)
                        ctrl.roleActionKeys.forEach((item) => {
                            item.Enabled = false;
                        });
                    ctrl.customerRole = data.CustomerRole != null ? data.CustomerRole.toString() : null;
                    ctrl.firstName = data.FirstName;
                    ctrl.lastName = data.LastName;
                    ctrl.phone = data.Phone;
                    ctrl.enabled = data.Enabled;
                    ctrl.headCustomerId = data.HeadCustomerId;
                    ctrl.birthDay = data.BirthDay;
                    ctrl.city = data.City;
                    ctrl.avatar = data.Avatar;
                    ctrl.photoSrc = data.PhotoSrc;
                    ctrl.position = data.Position;
                    ctrl.departmentId = data.DepartmentId;
                    ctrl.headUserId = data.HeadCustomerId;
                    ctrl.selectedRolesIds = data.ManagerRolesIds;
                    ctrl.editHimself = data.EditHimself;
                    ctrl.sign = data.Sign;
                    ctrl.customerFields = ctrl.customerFields || data.CustomerFields.filter((x) => x.ShowInUserEditing);
                    ctrl.fcmToken = data.FcmToken;
                    ctrl.adminAppNotificationsEnabled = data.AdminAppNotificationsEnabled;
                    ctrl.warehouseIdsAssignedToManager = data.WarehouseIdsAssignedToManager;
                    ctrl.twoFactorAuthEnabled = data.TwoFactorAuthEnabled;
                    ctrl.twoFactorAuthEnabledOnInit = ctrl.twoFactorAuthEnabled;
                }
                ctrl.addEditUserForm.$setPristine();
                ctrl.formInited = true;

                ctrl.getRolesValidation();
            });
        };

        ctrl.save = function () {
            ctrl.btnSleep = true;

            const params = {
                customerId: ctrl.customerId,
                customerRole: ctrl.customerRole,
                email: ctrl.email,
                firstName: ctrl.firstName,
                lastName: ctrl.lastName,
                phone: ctrl.phone,
                enabled: ctrl.enabled,
                headCustomerId: ctrl.headUserId,
                birthDay: ctrl.birthDay,
                city: ctrl.city,
                departmentId: ctrl.departmentId,
                position: ctrl.position,
                roleActionKeys: ctrl.roleActionKeys,
                managerRolesIds: ctrl.selectedRolesIds,
                avatar: ctrl.avatar,
                photoEncoded: ctrl.photoEncoded,
                sign: ctrl.sign,
                customerFields: ctrl.customerFields,
                adminAppNotificationsEnabled: ctrl.adminAppNotificationsEnabled,
                warehouseIdsAssignedToManager: ctrl.warehouseIdsAssignedToManager,
                twoFactorSecretKey: ctrl.Codes?.SecretKey,
                twoFactorQrCode: ctrl.Codes?.QrCode,
                twoFactorAuthEnabled: ctrl.twoFactorAuthEnabled,
                twoFactorAuthCode: ctrl.twoFactorAuthCode,
                rnd: Math.random(),
            };

            let url;
            switch (ctrl.mode) {
                case 'add':
                    url = 'users/addUser';
                    break;
                case 'me':
                    url = 'account/updateCurrentUser';
                    break;
                default:
                    url = 'users/updateUser';
                    break;
            }

            $http.post(url, params).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    toaster.pop(
                        'success',
                        '',
                        ctrl.mode == 'add'
                            ? $translate.instant('Admin.Js.Settings.AddEditUser.EmployeeAdded')
                            : $translate.instant('Admin.Js.Settings.AddEditUser.ChangesSaved'),
                    );
                    if (ctrl.photoEncoded) {
                        $scope.$emit('avatarupdated', { customerId: ctrl.customerId });
                    }

                    ctrl.getRolesValidation().then((result) => {
                        if (result) {
                            $uibModalInstance.close(data.obj.customer);
                        }
                    });

                    if (data.obj.reloadPage === true && ctrl.mode != 'me') {
                        window.location.reload();
                    }
                } else {
                    data.errors.forEach((error) => {
                        toaster.error($translate.instant('Admin.Js.Settings.AddEditUserCtrl.Error'), error);
                    });
                }
                ctrl.btnSleep = false;
            });
        };

        ctrl.getFormData = function () {
            const url = ctrl.mode == 'me' ? 'account/getUserFormData' : 'users/getUserFormData';
            return $http.get(url, { params: { customerId: ctrl.customerId, rnd: Math.random() } }).then((response) => {
                if (response.data.result === false) {
                    ctrl.close();
                    return;
                }

                const data = response.data.obj;
                if (data != null) {
                    ctrl.departments = data.departments;
                    ctrl.users = data.users;
                    ctrl.roles = data.roles;
                    ctrl.roleActionKeys = data.roleActionKeys;
                    ctrl.isAdmin = data.isAdmin;
                    ctrl.moderatorsAvailable = data.moderatorsAvailable;
                    ctrl.managersAvailable = data.managersAvailable;
                    ctrl.hasRoleActionAccess = data.hasRoleActionAccess;
                    ctrl.customerFields = data.customerFields;
                    ctrl.showWarehouses = data.showWarehouses;
                    ctrl.warehouses = data.warehouses;
                }
            });
        };

        ctrl.selectRoleActions = function (result) {
            ctrl.roleActionKeys = result.roleActionKeys;
        };

        ctrl.changePassword = function () {
            if (ctrl.customerId == null) return;
            SweetAlert.confirm($translate.instant('Admin.Js.Settings.AddEditUserCtrl.LinkToChangePassword'), {
                title: $translate.instant('Admin.Js.Settings.AddEditUserCtrl.ChangePassword'),
            }).then((result) => {
                if (result === true || result.value) {
                    const url = ctrl.mode == 'me' ? 'account/sendChangePasswordMail' : 'users/sendChangePasswordMail';
                    $http.post(url, { customerId: ctrl.customerId }).then((response) => {
                        const data = response.data;
                        if (data.result === true) {
                            toaster.pop('success', $translate.instant('Admin.Js.Settings.AddEditUserCtrl.LinkSuccessfullySent'));
                        } else {
                            data.errors.forEach((error) => {
                                toaster.error($translate.instant('Admin.Js.Settings.AddEditUserCtrl.Error'), error);
                            });
                        }
                    });
                }
            });

            if (isMobileService.getValue()) {
                document.querySelector('.swal2-container').style.zIndex = 2000;
            }
        };

        ctrl.updateAvatar = function (params) {
            if (params != null) {
                ctrl.avatar = params.fileName;
                ctrl.photoSrc = ctrl.photoEncoded = params.base64String;
            }
        };

        ctrl.deleteAvatar = function () {
            $http.post('common/deleteAvatar', { customerId: ctrl.customerId }).then((response) => {
                ctrl.avatar = null;
                $scope.$emit('avatarupdated', { customerId: ctrl.customerId });
            });
        };

        ctrl.getRolesValidation = function () {
            ctrl.rolesErrors = null;

            if (ctrl.customerId == null || ctrl.mode != 'edit') {
                return $q.resolve(true);
            }
            return $http
                .get('users/getRolesValidation', {
                    params: { customerId: ctrl.customerId, rolesIds: ctrl.selectedRolesIds },
                })
                .then((response) => {
                    ctrl.rolesErrors = response.data.errors;
                    return ctrl.rolesErrors == null || ctrl.rolesErrors.length == 0;
                });
        };

        ctrl.onTwoFactorAuthChange = function (isTwoFactorAuthEnabled) {
            if (isTwoFactorAuthEnabled && !ctrl.Codes) {
                ctrl.getQrCode();
            }
        };

        ctrl.getQrCode = function() {
            $http
                .get('account/getQrCode', {
                    params: {
                        customerId: ctrl.customerId
                    }
                })
                .then((response) => {
                    if (!response.data.result) {
                        toaster.pop('error', '', response.data.errors.join(' '));
                    }

                    ctrl.Codes = response.data.obj;
                    if (ctrl.Codes == null) {
                        ctrl.twoFactorAuthEnabled = false;
                        toaster.pop('error', '', $translate.instant('Admin.Js.Settings.AddEditUserCtrl.NoActiveTwoFactorAuthModules'));
                    }
                });
        };
    };

    ModalAddEditUserCtrl.$inject = ['$http', '$scope', '$q', '$uibModalInstance', 'SweetAlert', 'toaster', '$translate', 'isMobileService'];

    ng.module('uiModal').controller('ModalAddEditUserCtrl', ModalAddEditUserCtrl);
})(window.angular);
