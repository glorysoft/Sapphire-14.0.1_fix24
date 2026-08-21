import triggerHistoryTemplate from './templates/triggerHistory.html';
(function (ng) {
    

    ng.module('triggers').component('triggerHistory', {
        templateUrl: triggerHistoryTemplate,
        controller: 'TriggerHistoryCtrl',
        controllerAs: 'ctrl',
        bindings: {
            triggerId: '<?'
        },
    });
})(window.angular);
