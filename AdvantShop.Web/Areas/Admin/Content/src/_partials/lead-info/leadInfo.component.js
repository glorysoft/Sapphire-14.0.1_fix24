import leadInfoTemplate from './templates/lead-info.html';
(function (ng) {
    

    ng.module('leadInfo').component('leadInfo', {
        templateUrl: leadInfoTemplate,
        controller: 'LeadInfoCtrl',
        bindings: {
            close: '&',
            dismiss: '&',
            resolve: '<',
        },
    });
})(window.angular);
