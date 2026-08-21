(function (ng) {
    

    const lastStatisticsCtrl = function ($http, $timeout, $sce, lastStatisticsService) {
        const ctrl = this;

        ctrl.getValue = function () {
            let count = 0;
            ctrl.data = lastStatisticsService.getData();

            if (ctrl.data != null) {
                switch (ctrl.type) {
                    case 'orders':
                        count = ctrl.data.LastOrdersCount;
                        break;
                    case 'leads':
                        count = ctrl.data.LastLeadsCount;
                        break;
                    case 'tasks':
                        count = ctrl.data.LastTasksCount;
                        break;
                    case 'booking':
                        count = ctrl.data.LastBookingCount;
                        break;
                    case 'congratulations':
                        count = ctrl.data.CongratulationsSteps;
                        break;
                }
            }
            return count != 0 && count != 'undefined' ? $sce.trustAsHtml(`<span class="new-item">${  count <= 99 ? count : '99+'  }</span>`) : '';
        };
    };

    lastStatisticsCtrl.$inject = ['$http', '$timeout', '$sce', 'lastStatisticsService'];

    ng.module('statistics', []).controller('lastStatisticsCtrl', lastStatisticsCtrl);

    ng.module('statistics').directive('statisticsCount', () => ({
            restrict: 'A',
            scope: true,
            controller: 'lastStatisticsCtrl',
            controllerAs: 'statisticsCount',
            bindToController: true,
            link (scope, element, attrs, ctrl, transclude) {
                ctrl.type = attrs.type;
            },
        }));
})(window.angular);
