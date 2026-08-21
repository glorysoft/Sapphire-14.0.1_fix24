import activityActionsTemplate from './../templates/activity-actions.html';
(function (ng) {
    

    const ActivityActionsCtrl = function ($http) {
        const ctrl = this;
        ctrl.$onInit = function () {
            $http
                .get('activity/getActions', {
                    params: {
                        customerId: ctrl.customerId,
                    },
                })
                .then((response) => {
                    ctrl.items = response.data.DataItems;
                });
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    activityActions: ctrl,
                });
            }
        };
    };
    ActivityActionsCtrl.$inject = ['$http'];
    ng.module('activity').component('activityActions', {
        templateUrl: activityActionsTemplate,
        controller: ActivityActionsCtrl,
        bindings: {
            customerId: '<?',
            onInit: '&',
        },
    });
})(window.angular);
