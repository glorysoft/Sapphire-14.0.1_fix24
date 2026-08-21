import vortexTemplate from './vortex.html';
(function (ng) {
    

    const VortexCtrl = function ($http) {
        const ctrl = this;
        ctrl.$onInit = function () {
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    vortex: ctrl,
                });
            }
        };
        ctrl.recalc = function (dateFrom, dateTo) {
            ctrl.fetch(dateFrom, dateTo);
        };
        ctrl.fetch = function (dateFrom, dateTo) {
            $http
                .get('analytics/getVortex', {
                    params: {
                        dateFrom,
                        dateTo,
                    },
                })
                .then((result) => {
                    ctrl.vortex = result.data;
                });
        };
    };
    VortexCtrl.$inject = ['$http'];
    ng.module('analyticsReport')
        .controller('VortexCtrl', VortexCtrl)
        .component('vortex', {
            templateUrl: vortexTemplate,
            controller: VortexCtrl,
            bindings: {
                onInit: '&',
            },
        });
})(window.angular);
