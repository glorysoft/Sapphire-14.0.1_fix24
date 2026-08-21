(function (ng) {
    

    const TriggerStatisticsCtrl = function ($http, $translate, isMobileService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.isMobile = isMobileService.getValue();

            ctrl.getStatistics();
        };

        ctrl.onChangeTime = function () {
            ctrl.getStatistics();
        }

        ctrl.getStatistics = function () {

            const params = {
                triggerId: ctrl.triggerId,
                dateFrom: ctrl.dateFrom,
                dateTo: ctrl.dateTo
            };

            $http.get('triggers/getTriggerStatisticsGraph', { params })
                .then((response) => {
                    ctrl.actionStatistics = response.data.ActionStatistics;
                    ctrl.pushStatistics = response.data.PushStatistics;
                });
        };
    };

    TriggerStatisticsCtrl.$inject = ['$http', '$translate', 'isMobileService'];

    ng.module('triggers').controller('TriggerStatisticsCtrl', TriggerStatisticsCtrl);
})(window.angular);
