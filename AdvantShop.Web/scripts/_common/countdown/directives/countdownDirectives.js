import countdownTemplate from '../templates/countdown.html';

(function (ng) {
    

    ng.module('countdown').directive('countdown', () => ({
            restrict: 'A',
            scope: {
                endTime: '=',
                endTimeUtc: '=',
                isShowDays: '<?',
                onFinish: '&',
            },
            replace: true,
            controller: 'CountdownCtrl',
            controllerAs: 'countdown',
            bindToController: true,
            templateUrl (element, attrs) {
                return attrs.templateUrl || countdownTemplate;
            },
        }));
})(window.angular);
