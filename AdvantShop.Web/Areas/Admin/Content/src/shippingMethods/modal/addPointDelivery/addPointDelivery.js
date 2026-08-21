import './addPointDelivery.html';
(function (ng) {
    

    const ModalAddPointDeliveryCtrl = function ($uibModalInstance, $http) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve ? ctrl.$resolve.params : null;
            ctrl.mode = (params ? params.point : null) ? 'edit' : 'add';
            ctrl.point = (params && params.point ? ng.extend({}, params.point) : null) || {
                Latitude: 0.0,
                Longitude: 0.0,
            };
            ctrl.point.position = `${ctrl.point.Latitude  }, ${  ctrl.point.Longitude}`;
            ctrl.methodId = params ? params.methodId : null;
            ctrl.isProgress = true;
            ctrl.getPayments().then(() => {
                ctrl.isProgress = false;
            })
        };

        ctrl.getPayments = function () {
            return $http.get('shippingMethods/getPayments', { params: { methodId: ctrl.methodId } })
                .then((response) => {
                    ctrl.payments = response.data.filter((x) => x.Active === true);
                    ctrl.selectedPaymentMethods =
                        ctrl.payments != null
                            ? ctrl.payments
                                .filter((x) => !ctrl.point.NotAvailablePayments || !ctrl.point.NotAvailablePayments.includes(x.PaymentMethodId))
                                .map((x) => x.PaymentMethodId)
                            : null;
                });
        }

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            const coordinats = ctrl.point.position.replace(/\[|\]/g, '').split(',');
            ctrl.point.Latitude = parseFloat(coordinats[0].trim());
            ctrl.point.Longitude = parseFloat(coordinats[1].trim());
            delete ctrl.point.position;

            ctrl.point.NotAvailablePayments =
                ctrl.payments != null
                    ? ctrl.payments
                        .filter((x) => !ctrl.selectedPaymentMethods || !ctrl.selectedPaymentMethods.includes(x.PaymentMethodId))
                        .map((x) => x.PaymentMethodId)
                    : null;

            $uibModalInstance.close(ctrl.point);
        };
    };

    ModalAddPointDeliveryCtrl.$inject = ['$uibModalInstance', '$http'];

    ng.module('uiModal').controller('ModalAddPointDeliveryCtrl', ModalAddPointDeliveryCtrl);
})(window.angular);
