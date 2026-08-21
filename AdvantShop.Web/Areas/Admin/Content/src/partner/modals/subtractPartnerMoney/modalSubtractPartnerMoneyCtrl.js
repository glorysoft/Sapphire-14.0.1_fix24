(function (ng) {
    

    const ModalSubtractPartnerMoneyCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.partnerId = params.partnerId;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.submit = function () {
            $http.post('partners/subtractMoney', { partnerId: ctrl.partnerId, amount: ctrl.amount, basis: ctrl.basis }).then((response) => {
                const data = response.data;
                if (data.result) {
                    $uibModalInstance.close();
                    toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                } else {
                    toaster.error('', (data.errors || [])[0] || $translate.instant('Admin.Js.ErrorWhileSaving'));
                }
            });
        };
    };

    ModalSubtractPartnerMoneyCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalSubtractPartnerMoneyCtrl', ModalSubtractPartnerMoneyCtrl);
})(window.angular);
