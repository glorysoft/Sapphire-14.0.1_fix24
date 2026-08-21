(function (ng) {
    

    const ModalSendMobileAppNotification = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.customerId = params.customerId;
        };

        ctrl.sendNotification = function () {
            ctrl.sendingNotification = true;
            $http
                .post('customers/sendMobileAppNotification', {
                    customerId: ctrl.customerId,
                    body: ctrl.body,
                    title: ctrl.title,
                })
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.Customer.PushSended'));
                    } else {
                        toaster.error('', (data.errors || [])[0] || $translate.instant('Admin.Js.Customer.ErrorWhileSending'));
                    }
                    ctrl.sendingNotification = false;
                });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalSendMobileAppNotification.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalSendMobileAppNotificationCtrl', ModalSendMobileAppNotification);
})(window.angular);
