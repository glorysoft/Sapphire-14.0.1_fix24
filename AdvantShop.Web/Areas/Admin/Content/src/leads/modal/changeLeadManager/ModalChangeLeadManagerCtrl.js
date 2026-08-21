(function (ng) {
    

    const ModalChangeLeadManagerCtrl = function ($http, $uibModalInstance, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const resolve = ctrl.$resolve;
            ctrl.params = resolve.params;
            ctrl.getManagers();
        };

        ctrl.getManagers = function () {
            $http.get('managers/getManagersSelectOptions?roleActions=Crm').then((response) => {
                ctrl.managers = [{ label: '-', value: '' }].concat(response.data);
                ctrl.newManagerId = ctrl.managers[0].value;
            });
        };

        ctrl.save = function () {
            ctrl.btnSaveDisabled = true;

            $http.post('leads/changeManager', ng.extend(ctrl.params || {}, { newManagerId: ctrl.newManagerId })).then((response) => {
                if (response.data.result === true) {
                    toaster.pop('success', '', 'Изменения успешно сохранены');
                }
                $uibModalInstance.close();
                ctrl.btnSaveDisabled = false;
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalChangeLeadManagerCtrl.$inject = ['$http', '$uibModalInstance', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalChangeLeadManagerCtrl', ModalChangeLeadManagerCtrl);
})(window.angular);
