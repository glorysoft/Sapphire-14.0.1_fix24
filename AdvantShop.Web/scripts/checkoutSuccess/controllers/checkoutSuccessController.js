/* @ngInject */
function CheckOutSuccessCtrl($document, $http, $window, $sce, windowService, $timeout) {
    const ctrl = this;

    ctrl.payment = {};
    ctrl.isPaymentProceeded = false;

    ctrl.submitNow = function () {
        $timeout(() => {
            const form = $document[0].querySelector('.js-checkout-success form:not(.js-disable-autosubmit)');
            if (form != null) {
                form.submit();
            } else {
                const link = $document[0].querySelector('.js-checkout-success a') || $document[0].querySelector('.js-checkout-success button');
                if (link != null) {
                    link.click();
                }
            }

            ctrl.isPaymentProceeded = true;
        }, 100);
    };

    ctrl.getPayInfo = function (orderid) {
        $http.get('checkout/getpaymentinfo', { params: { orderid } }).then((response) => {
            angular.extend(ctrl.payment, response.data);

            if (ctrl.payment.proceedToPayment === true) {
                if ($document[0].readyState !== 'complete') {
                    $window.addEventListener('load', function load() {
                        $window.removeEventListener('load', load);

                        $timeout(() => {
                            ctrl.submitNow();
                        }, 5000);
                    });
                } else {
                    $timeout(() => {
                        ctrl.submitNow();
                    }, 5000);
                }
            }
        });
    };

    ctrl.print = function (url) {
        windowService.print(url, 'checkoutSuccess');
    };
}

export default CheckOutSuccessCtrl;
