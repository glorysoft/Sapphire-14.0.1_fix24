(function (ng) {
    

    const ModalEditPaymentTypeNameCtrl = function ($uibModalInstance, toaster, $translate, $http) {
        const ctrl = this;

        ctrl.id = ctrl.$resolve.item.Id;
        ctrl.name = ctrl.$resolve.item.Name;

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            $http
                .post('settingsPartners/updatePaymentType', { id: ctrl.id, name: ctrl.name })
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                    } else {
                        toaster.error('', (data.errors || [])[0] || $translate.instant('Admin.Js.ErrorWhileSaving'));
                    }
                })
                .then((res) => {
                    $uibModalInstance.close(ctrl.name);
                });
        };
    };

    ModalEditPaymentTypeNameCtrl.$inject = ['$uibModalInstance', 'toaster', '$translate', '$http'];

    ng.module('uiModal').controller('ModalEditPaymentTypeNameCtrl', ModalEditPaymentTypeNameCtrl);
})(window.angular);
