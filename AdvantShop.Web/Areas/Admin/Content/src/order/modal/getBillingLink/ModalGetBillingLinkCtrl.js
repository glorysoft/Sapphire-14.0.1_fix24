(function (ng) {
    

    const ModalGetBillingLinkCtrl = function ($uibModalInstance, $http, $timeout, $window, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.orderId = params.orderId;

            $http.get('orders/getBillingLink', { params: { orderId: ctrl.orderId } }).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    ctrl.link = data.obj.link;
                    ctrl.shortLink = data.obj.shortLink;
                    ctrl.showSendToCustomerLink = data.obj.showSendToCustomerLink;

                    setTimeout(ctrl.select, 200);
                } else {
                    data.errors.forEach((error) => {
                        ctrl.error = error;
                    });
                }
            });
        };

        ctrl.generateShortBillingLink = function () {
            $http.post('orders/generateShortBillingLink', { orderId: ctrl.orderId }).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    toaster.success('', $translate.instant('Admin.Js.GetBillingLink.ShortLinkGenerated'));
                    ctrl.shortLink = data.obj;
                    $timeout(() => {
                        ctrl.select('.js-copy-short');
                    }, 200);
                } else {
                    data.errors.forEach((error) => {
                        ctrl.error = error;
                    });
                }
            });
        };

        ctrl.copyToClipboard = function (selector) {
            selector ||= '.js-copy';
            const copyTextarea = document.querySelector(selector);
            copyTextarea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) toaster.pop('success', '', $translate.instant('Admin.Js.Order.LinkCopied'));
            } catch (err) {
                console.log('Oops, unable to copy');
            }
        };

        ctrl.select = function (selector) {
            selector ||= '.js-copy';
            const copyTextarea = document.querySelector(selector);
            copyTextarea.select();
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalGetBillingLinkCtrl.$inject = ['$uibModalInstance', '$http', '$timeout', '$window', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalGetBillingLinkCtrl', ModalGetBillingLinkCtrl);
})(window.angular);
