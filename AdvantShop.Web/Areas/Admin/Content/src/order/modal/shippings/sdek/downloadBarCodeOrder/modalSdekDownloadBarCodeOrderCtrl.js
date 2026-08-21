(function (ng) {
    

    const ModalSdekDownloadBarCodeOrderCtrl = function ($uibModalInstance, $window, toaster, $q, $http, urlHelper) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.obj;
            ctrl.orderId = params.orderId;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getSendUrl = function () {
            const params = {
                orderId: ctrl.orderId,
                copyCount: ctrl.copyCount,
                format: ctrl.format,
                lang: ctrl.lang,
            };
            for (const key in params) {
                if (Object.hasOwn(params, key)) {
                    if (!params[key]) {
                        delete params[key];
                    }
                }
            }

            return `orders/sdekBarCodeOrder?${  urlHelper.paramsToString(params)}`;
        };
    };

    ModalSdekDownloadBarCodeOrderCtrl.$inject = ['$uibModalInstance', '$window', 'toaster', '$q', '$http', 'urlHelper'];

    ng.module('uiModal').controller('ModalSdekDownloadBarCodeOrderCtrl', ModalSdekDownloadBarCodeOrderCtrl);
})(window.angular);
