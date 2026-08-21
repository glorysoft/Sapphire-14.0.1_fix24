import integrationsLimitTemplate from './integrationsLimit.html';
(function (ng) {
    

    const integrationsLimitCtrl = function ($http, toaster, SweetAlert, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {};
    };
    integrationsLimitCtrl.$inject = ['$http', 'toaster', 'SweetAlert', '$translate'];
    ng.module('integrationsLimit', [])
        .controller('integrationsLimitCtrl', integrationsLimitCtrl)
        .component('integrationsLimit', {
            templateUrl: integrationsLimitTemplate,
            controller: 'integrationsLimitCtrl',
            bindings: {
                limit: '<',
                count: '<',
            },
        });
})(window.angular);
