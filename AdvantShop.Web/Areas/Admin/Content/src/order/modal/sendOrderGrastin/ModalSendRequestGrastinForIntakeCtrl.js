(function (ng) {
    

    const ModalSendRequestGrastinForIntakeCtrl = function ($uibModalInstance, $window, toaster, $q, $http, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.obj;
            ctrl.orderId = params.orderId;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.send = function () {
            const params = {
                orderId: ctrl.orderId,
                regionId: ctrl.regionId,
                time: ctrl.time,
                volume: ctrl.volume,
            };

            $http.post('grastin/sendrequestforintake', params).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Order.ApplicationSuccessfullySent'));
                    $uibModalInstance.close();
                } else {
                    ctrl.btnLoading = false;
                    data.errors.forEach((error) => {
                        toaster.pop('error', '', error);
                    });
                }
            });
        };
    };

    ModalSendRequestGrastinForIntakeCtrl.$inject = ['$uibModalInstance', '$window', 'toaster', '$q', '$http', '$translate'];

    ng.module('uiModal').controller('ModalSendRequestGrastinForIntakeCtrl', ModalSendRequestGrastinForIntakeCtrl);
})(window.angular);
