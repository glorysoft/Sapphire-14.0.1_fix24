import sourcesTemplate from './sources.html';
(function (ng) {
    

    const AnalyticsSourcesCtrl = function ($http) {
        const ctrl = this;
        ctrl.$onInit = function () {
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    analyticsSources: ctrl,
                });
            }
        };
        ctrl.recalc = function (dateFrom, dateTo, paid, status) {
            ctrl.fetch(dateFrom, dateTo, paid, status);
        };
        ctrl.fetch = function (dateFrom, dateTo, paid, status) {
            $http
                .get('bookingAnalytics/getBookingSources', {
                    params: {
                        dateFrom,
                        dateTo,
                        isPaid: paid,
                        status,
                        affiliateId: ctrl.affiliateId,
                    },
                })
                .then((result) => {
                    ctrl.BookingSources = result.data;
                });
        };
    };
    AnalyticsSourcesCtrl.$inject = ['$http'];
    ng.module('bookingAnalytics')
        .controller('AnalyticsSourcesCtrl', AnalyticsSourcesCtrl)
        .component('bookingAnalyticsSources', {
            templateUrl: sourcesTemplate,
            controller: AnalyticsSourcesCtrl,
            bindings: {
                onInit: '&',
                affiliateId: '<?',
            },
        });
})(window.angular);
