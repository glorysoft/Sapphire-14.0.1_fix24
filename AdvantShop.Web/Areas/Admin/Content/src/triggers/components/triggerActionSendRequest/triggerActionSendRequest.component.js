import triggerActionSendRequestTemplate from './templates/triggerActionSendRequest.html';
(function (ng) {
    

    ng.module('triggers').component('triggerActionSendRequest', {
        templateUrl: triggerActionSendRequestTemplate,
        controller: 'TriggerActionSendRequestCtrl',
        controllerAs: 'ctrl',
        bindings: {
            eventType: '=',
            action: '=',
            sendRequestParameters: '=',
        },
    });
})(window.angular);
