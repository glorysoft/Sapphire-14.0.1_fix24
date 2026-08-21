(function (ng) {
    

    const ModalAddEditAdditionalSettingsCityCtrl = function ($uibModalInstance, $http, toaster, $translate, SweetAlert) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.cityId = ctrl.$resolve.entity.CityId;
            ctrl.getSetings(ctrl.cityId);
        };

        ctrl.init = function (formAddEditAdditionalSettings) {
            ctrl.form = formAddEditAdditionalSettings;
        };

        ctrl.getSetings = function (cityId) {
            $http.get('Cities/GetAdditionalSettings', { params: { cityId } }).then((response) => {
                const data = response.data;
                if (data.result) {
                    ctrl.settings = data.obj;
                }
                ctrl.form.$setPristine();
            });
        };

        ctrl.return = function (formModified) {
            if (formModified) {
                SweetAlert.confirm('Необходимо сохранить дополнительные настройки', {
                    title: 'Настройки не сохранены',
                    confirmButtonText: 'Сохранить и открыть',
                }).then((result) => {
                    if (result === true || result.value === true) {
                        ctrl.save().then((data) => {
                            if (data.result) {
                                $uibModalInstance.close({
                                    returnToMainSettings: true,
                                    entity: {
                                        CityId: ctrl.cityId,
                                    },
                                });
                            }
                        });
                    }
                });
            } else {
                $uibModalInstance.close({
                    returnToMainSettings: true,
                    entity: {
                        CityId: ctrl.cityId,
                    },
                });
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.saveAndReturn = function () {
            ctrl.save().then((data) => {
                if (data.result) ctrl.return();
            });
        };

        ctrl.save = function () {
            ctrl.btnSleep = true;
            return $http
                .post('Cities/EditAdditionalSettings', ctrl.settings)
                .then((response) => {
                    const data = response.data;
                    if (data.result == true) {
                        ctrl.form.$setPristine();
                        toaster.pop('success', '', $translate.instant('Admin.Js.SettingsSystem.ChangesSaved'));
                    } else if (data.errors && data.errors.length > 0) {
                            data.errors.forEach((error) => {
                                toaster.pop('error', error);
                            });
                        } else {
                            toaster.pop(
                                'error',
                                $translate.instant('Admin.Js.SettingsSystem.Error'),
                                $translate.instant('Admin.Js.SettingsSystem.ErrorCreatingCity'),
                            );
                        }

                    return data;
                })
                .finally(() => {
                    ctrl.btnSleep = false;
                });
        };
    };

    ModalAddEditAdditionalSettingsCityCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate', 'SweetAlert'];

    ng.module('uiModal').controller('ModalAddEditAdditionalSettingsCityCtrl', ModalAddEditAdditionalSettingsCityCtrl);
})(window.angular);
