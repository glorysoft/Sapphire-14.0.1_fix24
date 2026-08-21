(function (ng) {
    

    const PARAM_KEY = 'customerIdInfo';
    /* @ngInject */
    const customerInfoService = function ($location, $uibModal, $timeout, $window) {
        const service = this;

        service.addInstance = function (params, options) {
            const scrollTop = $window.pageYOffset;
            return $uibModal
                .open({
                    component: 'customerInfo',
                    controllerAs: '$ctrl',
                    windowClass: 'lead-info',
                    openedClass: 'modal-open lead-info-modal--open',
                    resolve: { instance: { customerId: params.customerId, partnerId: params.partnerId } },
                })
                .result.then(
                    () => {},
                    (dismissResult) => {
                        if (options != null && options.onClose != null) {
                            options.onClose({ result: dismissResult });
                        }
                    },
                )
                .finally(() => {
                    service.removeUrlParam();
                    $timeout(() => {
                        $window.scrollTo(0, scrollTop);
                    }, 0);
                });
        };

        service.setUrlParam = function (customerid) {
            $location.search(PARAM_KEY, customerid);
        };

        service.removeUrlParam = function () {
            $location.search(PARAM_KEY, null);
        };

        service.getUrlParam = function () {
            const search = $location.search();
            return search != null && search[PARAM_KEY] != null ? search[PARAM_KEY] : null;
        };
    };

    ng.module('customerInfo').service('customerInfoService', customerInfoService);
})(window.angular);
