import paymentMethodsTemplate from './PaymentMethods.html';
(function (ng) {
    

    const AnalyticsPaymentMethodsCtrl = function ($http) {
        const ctrl = this;
        ctrl.$onInit = function () {
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    analyticsPaymentMethods: ctrl,
                });
            }
        };
        ctrl.recalc = function (dateFrom, dateTo, paid, status) {
            ctrl.fetch(dateFrom, dateTo, paid, status);
        };
        ctrl.fetch = function (dateFrom, dateTo, paid, status) {
            ctrl.status = status;
            $http
                .get('bookingAnalytics/getPaymentMethods', {
                    params: {
                        dateFrom,
                        dateTo,
                        isPaid: paid,
                        status,
                        affiliateId: ctrl.affiliateId,
                    },
                })
                .then((result) => {
                    ctrl.PaymentMethods = result.data;
                });
        };
        ctrl.showBookings = function (paymentMethodId) {
            if (ctrl.showBookingsFn) {
                ctrl.showBookingsFn({
                    params: {
                        paymentMethodId: paymentMethodId.toString(),
                        nostatus: !ctrl.status || ctrl.status === 'null' ? '3' : undefined,
                    },
                });
            }
        };
    };
    AnalyticsPaymentMethodsCtrl.$inject = ['$http'];
    ng.module('bookingAnalytics')
        .controller('AnalyticsPaymentMethodsCtrl', AnalyticsPaymentMethodsCtrl)
        .component('bookingAnalyticsPaymentMethods', {
            templateUrl: paymentMethodsTemplate,
            controller: AnalyticsPaymentMethodsCtrl,
            bindings: {
                onInit: '&',
                affiliateId: '<?',
                showBookingsFn: '&',
            },
        });
})(window.angular);
