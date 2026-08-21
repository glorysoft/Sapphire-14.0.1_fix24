import triggerStatisticsTemplate from './templates/triggerStatistics.html';
(function (ng) {
    

    ng.module('triggers').component('triggerStatistics', {
        templateUrl: triggerStatisticsTemplate,
        controller: 'TriggerStatisticsCtrl',
        controllerAs: 'ctrl',
        bindings: {
            triggerId: '<?',
            dateFrom: '@',
            dateTo: '@'
        },
    });
})(window.angular);
