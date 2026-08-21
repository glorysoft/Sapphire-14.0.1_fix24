import triggerActionEditFieldTemplate from './templates/triggerActionEditField.html';
(function (ng) {
    

    ng.module('triggers').component('triggerActionEditField', {
        templateUrl: triggerActionEditFieldTemplate,
        controller: 'TriggerActionEditFieldCtrl',
        controllerAs: 'ctrl',
        bindings: {
            eventType: '=',
            action: '=',
            fields: '<',
            isLicense: '<',
            comparers: '<',
        },
    });
})(window.angular);
