import abcxyzAnalysisTemplate from './abcxyzAnalysis.html';
(function (ng) {
    

    const AbcxyzAnalysisCtrl = function ($http) {
        const ctrl = this;
        ctrl.$onInit = function () {
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    abcxyz: ctrl,
                });
            }
        };
        ctrl.recalc = function (dateFrom, dateTo) {
            ctrl.from = dateFrom;
            ctrl.to = dateTo;
            ctrl.fetch();
            ctrl.getData();
        };
        ctrl.fetch = function () {
            $http
                .get('analytics/getAbcxyzAnalysis', {
                    params: {
                        dateFrom: ctrl.from,
                        dateTo: ctrl.to,
                    },
                })
                .then((result) => {
                    ctrl.Data = result.data;
                });
        };
        ctrl.getData = function () {
            $http.get('analytics/getCatalogData').then((result) => {
                ctrl.ProductsData = result.data;
            });
        };
        ctrl.showProducts = function (group) {
            const url = `analytics/analyticsFilter?from=${  ctrl.from  }&to=${  ctrl.to  }&group=${  group  }&type=abcxyz`;
            const win = window.open(url, '_blank');
            win.focus();
        };
    };
    AbcxyzAnalysisCtrl.$inject = ['$http'];
    ng.module('analyticsReport')
        .controller('AbcxyzAnalysisCtrl', AbcxyzAnalysisCtrl)
        .component('abcxyzAnalysis', {
            templateUrl: abcxyzAnalysisTemplate,
            controller: AbcxyzAnalysisCtrl,
            bindings: {
                onInit: '&',
            },
        });
})(window.angular);
