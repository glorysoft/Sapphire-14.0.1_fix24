import './AddEditRegions.html';
(function (ng) {
    

    const ModalAddEditRegionsCtrl = function ($uibModalInstance, $http, toaster, $translate, SweetAlert) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.entity = ctrl.$resolve != null ? ctrl.$resolve.entity : null;
            ctrl.getFormData();
            ctrl.mode = ctrl.entity.RegionId ? 'edit' : 'add';
            if (ctrl.entity && ctrl.entity.RegionId) {
                ctrl.getRegion(ctrl.entity.RegionId);
            }
        };

        ctrl.init = function (form) {
            ctrl.form = form;
        };

        ctrl.getRegion = function (regionId) {
            $http.get('regions/getregionitem', { params: { RegionID: regionId, rnd: Math.random() } }).then((response) => {
                ctrl.entity = response.data;
                ctrl.form.$setPristine();
            });
        };

        ctrl.getFormData = function () {
            $http.get('regions/getFormData').then((response) => {
                ctrl.formData = response.data;
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.openAdditionalSettings = function (formModified) {
            if (formModified) {
                SweetAlert.confirm('Необходимо сохранить основные настройки', {
                    title: 'Настройки не сохранены',
                    confirmButtonText: 'Сохранить и открыть',
                }).then((result) => {
                    if (result === true || result.value === true) {
                        ctrl.saveRegions(false).then((data) => {
                            if (data.result) {
                                $uibModalInstance.close({
                                    openAdditionalSettings: true,
                                    entity: ctrl.entity,
                                });
                            }
                        });
                    }
                });
            } else {
                $uibModalInstance.close({
                    openAdditionalSettings: true,
                    entity: ctrl.entity,
                });
            }
        };

        ctrl.saveRegions = function (closeModal) {
            ctrl.btnSleep = true;

            const url = ctrl.mode === 'add' ? 'Regions/AddRegion' : 'Regions/EditRegion';

            return $http
                .post(url, ctrl.entity)
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.SettingsSystem.ChangesSaved'));
                        if (closeModal) {
                            $uibModalInstance.close(ctrl.entity);
                        }
                        ctrl.entity = null;
                    } else {
                        toaster.pop(
                            'error',
                            $translate.instant('Admin.Js.SettingsSystem.Error'),
                            $translate.instant('Admin.Js.SettingsSystem.ErrorCreatingRegion'),
                        );
                    }
                })
                .finally(() => {
                    ctrl.btnSleep = false;
                });
        };
    };

    ModalAddEditRegionsCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate', 'SweetAlert'];

    ng.module('uiModal').controller('ModalAddEditRegionsCtrl', ModalAddEditRegionsCtrl);
})(window.angular);
