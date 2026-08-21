import activityCallsTemplate from './../templates/activity-calls.html';
(function (ng) {
    

    const ActivityCallsCtrl = function ($http) {
        const ctrl = this;
        if (ctrl.standardPhone == null || ctrl.standardPhone == '') {
            return;
        }
        ctrl.$onInit = function () {
            $http
                .get('activity/getCalls', {
                    params: {
                        customerId: ctrl.customerId,
                        standardPhone: ctrl.standardPhone,
                    },
                })
                .then((response) => {
                    ctrl.items = response.data.DataItems;
                });
        };
    };
    ActivityCallsCtrl.$inject = ['$http'];
    ng.module('activity').component('activityCalls', {
        templateUrl: activityCallsTemplate,
        controller: ActivityCallsCtrl,
        bindings: {
            customerId: '<?',
            standardPhone: '<?',
        },
    });
})(window.angular);
