import './payments.html';

(function (ng) {
    

    const ModalPaymentsCtrl = function ($uibModalInstance, $window, toaster, $q, $http, $translate) {
        const ctrl = this;

        ctrl.paymentLoading = true;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.order;

            ctrl.orderId = params.orderId;
            ctrl.selectPayment = { Id: ctrl.$resolve.paymentMethodId };

            ctrl.contact = {
                Country: params.country,
                Region: params.region,
                District: params.district,
                City: params.city, //City - с большой потому что используется в scripts\_partials\shipping\extend\yandexdelivery\yandexdelivery.js
            };

            ctrl.getPayments();
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getPayments = function () {
            $http
                .get('orders/getPayments', { params: ng.extend(ctrl.contact, { orderId: ctrl.orderId }) })
                .then((response) => {
                    const data = response.data;
                    if (data != null) {
                        ctrl.payments = data.payments;
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

            $http
                .post('orders/savePayment', ng.extend(ctrl.contact, { orderId: ctrl.orderId, payment: ctrl.selectPayment }))
                .then((response) => {
                    const data = response.data;
                    if(data.result)
                    {
                        $uibModalInstance.close({ payment: ctrl.selectPayment });
                    }

                    toaster.pop('error', '', data.errors.length > 0
                        ? data.errors.join('<br>')
                        : $translate.instant('Admin.Js.Order.ErrorSavePaymentMethod'));
                });
        };

        ctrl.changePayment = function (payment) {
            ctrl.selectPayment = payment;
        };
    };

    ModalPaymentsCtrl.$inject = ['$uibModalInstance', '$window', 'toaster', '$q', '$http', '$translate'];

    ng.module('uiModal').controller('ModalPaymentsCtrl', ModalPaymentsCtrl);
})(window.angular);
