import triggerActionSendNotificationTemplate from './templates/triggerActionSendNotification.html';
(function (ng) {
    

    ng.module('triggers').component('triggerActionSendNotification', {
        templateUrl: triggerActionSendNotificationTemplate,
        controller: 'TriggerActionSendNotificationCtrl',
        controllerAs: 'ctrl',
        bindings: {
            action: '=',
            allowSendNotification: '=',
            pushNotificationErrorMessage: '=',
            availableVariables: '=',
        },
    });
})(window.angular);
