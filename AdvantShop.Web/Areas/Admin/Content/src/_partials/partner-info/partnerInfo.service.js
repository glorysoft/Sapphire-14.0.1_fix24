(function (ng) {
    

    const PARAM_KEY = 'partnerIdInfo';

    const partnerInfoService = function ($location, $http, $q, $window, $uibModal, $timeout) {
        const service = this,
            arrayDefers = [];

        service.initContainer = function (container) {
            arrayDefers.forEach((defer) => {
                defer.resolve(container);
            });
        };

        service.addEditPartner = function (params, options) {
            const scrollTop = $window.pageYOffset;
            return $uibModal
                .open({
                    component: 'partnerInfo',
                    controllerAs: '$ctrl',
                    windowClass: 'lead-info',
                    openedClass: 'modal-open lead-info-modal--open',
                    resolve: { params },
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
                    service.removeUrlParam(params);
                    $timeout(() => {
                        $window.scrollTo(0, scrollTop);
                    }, 0);
                });
        };

        service.setUrlParam = function (partnerid) {
            $location.search(PARAM_KEY, partnerid);
        };

        service.removeUrlParam = function () {
            $location.search(PARAM_KEY, null);
        };

        service.getUrlParam = function () {
            const search = $location.search();
            return search != null && search[PARAM_KEY] != null ? search[PARAM_KEY] : null;
        };
    };

    partnerInfoService.$inject = ['$location', '$http', '$q', '$window', '$uibModal', '$timeout'];

    ng.module('partnerInfo').service('partnerInfoService', partnerInfoService);
})(window.angular);
