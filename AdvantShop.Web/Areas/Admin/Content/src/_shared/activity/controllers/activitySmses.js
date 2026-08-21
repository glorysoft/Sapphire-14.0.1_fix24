import activitySmsesTemplate from './../templates/activity-smses.html';
(function (ng) {
    

    /* @ngInject */
    const ActivitySmsesCtrl = function ($http) {
        const ctrl = this;
        ctrl.$onInit = function () {
            if (ctrl.standardPhone == null || ctrl.standardPhone == '') {
                return;
            }
            $http
                .get('activity/getSmses', {
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
    ng.module('activity').component('activitySmses', {
        templateUrl: activitySmsesTemplate,
        controller: ActivitySmsesCtrl,
        bindings: {
            customerId: '<?',
            standardPhone: '<?',
        },
    });
})(window.angular);
