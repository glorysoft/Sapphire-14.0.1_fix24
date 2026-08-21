import './AddEditCountry.html';

(function (ng) {
    

    const ModalAddEditCountryCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.entity = ng.copy(ctrl.$resolve != null ? (ctrl.$resolve.entity != null ? ctrl.$resolve.entity : {}) : {});

            ctrl.mode = ctrl.entity.CountryId != null && ctrl.entity.CountryId != 0 ? 'edit' : 'add';
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.saveCountry = function () {
            ctrl.btnSleep = true;

            const url = ctrl.mode == 'add' ? 'Countries/AddCountry' : 'Countries/EditCountry';

            $http
                .post(url, ctrl.entity)
                .then((response) => {
                    const data = response.data;
                    if (data.result == true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.SettingsSystem.ChangesSaved'));
                        $uibModalInstance.close(ctrl.entity);
                        ctrl.entity = null;
                    } else {
                        toaster.pop(
                            'error',
                            $translate.instant('Admin.Js.SettingsSystem.Error'),
                            $translate.instant('Admin.Js.SettingsSystem.ErrorWhenCreatingCountry'),
                        );
                    }
                })
                .finally(() => {
                    ctrl.btnSleep = false;
                });
        };
    };

    ModalAddEditCountryCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditCountryCtrl', ModalAddEditCountryCtrl);
})(window.angular);
