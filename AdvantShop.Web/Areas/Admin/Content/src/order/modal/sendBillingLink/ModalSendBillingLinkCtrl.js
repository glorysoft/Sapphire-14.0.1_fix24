import './sendBillingLink.html';

(function (ng) {
    

    const ModalSendBillingLinkCtrl = function ($uibModalInstance, $http, $window, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.orderId = params.orderId;

            $http.get('orders/getBillingLinkMailTemplate', { params: { orderId: ctrl.orderId } }).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    ctrl.subject = data.subject;
                    ctrl.text = data.text;
                } else {
                    data.errors.forEach((error) => {
                        ctrl.error = error;
                    });
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.send = function () {
            if (ctrl.subject == null || ctrl.text == null) {
                toaster.pop('error', '', $translate.instant('Admin.Js.Order.FillInRequiredFields'));
                return;
            }

            const params = {
                orderId: ctrl.orderId,
                subject: ctrl.subject,
                text: ctrl.text,
            };

            $http.post('orders/sendBillingLink', params).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Order.EmailSuccessfullySent'));
                    $uibModalInstance.close();
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', '', error);
                    });
                }
            });
        };
    };

    ModalSendBillingLinkCtrl.$inject = ['$uibModalInstance', '$http', '$window', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalSendBillingLinkCtrl', ModalSendBillingLinkCtrl);
})(window.angular);
