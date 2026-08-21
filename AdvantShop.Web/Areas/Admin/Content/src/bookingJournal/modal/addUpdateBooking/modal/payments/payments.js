import './payments.html';

(function (ng) {
    

    const ModalBookingPaymentsCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.paymentLoading = true;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            const summary = params.summary;

            ctrl.getPayments(summary);
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getPayments = function (summary) {
            $http
                .post('booking/getPayments', { summary })
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        ctrl.payments = data.obj.payments;
                    } else {
                        data.errors.forEach((error) => {
                            toaster.pop('error', error);
                        });

                        if (!data.errors) {
                            toaster.pop('error', 'Не удалось загрузить список оплаты');
                        }
                    }
                })
                .finally(() => {
                    ctrl.paymentLoading = false;
                });
        };

        ctrl.changePayment = function (payment) {
            ctrl.selectPayment = payment;
        };

        ctrl.save = function () {
            if (ctrl.selectPayment == null) {
                toaster.pop('error', '', $translate.instant('Admin.Js.Order.SelectThePaymentMethod'));
                return;
            }

            $uibModalInstance.close({ payment: ctrl.selectPayment });
        };
    };

    ModalBookingPaymentsCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalBookingPaymentsCtrl', ModalBookingPaymentsCtrl);
})(window.angular);
