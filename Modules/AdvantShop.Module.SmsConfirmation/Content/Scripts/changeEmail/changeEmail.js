; (function (ng) {

    'use strict';

    var SmsConfirmationChangeEmailCtrl = function ($http, $window, toaster) {

        var ctrl = this;

        ctrl.changeEmail = function () {
            $http.post('smsconfirmationclient/changeEmail', { email: ctrl.newEmail }).then(function (response) {
                var data = response.data;
                if (data.result != true) {
                    if (data.errors != null && data.errors.length > 0) {
                        toaster.pop('error', null, data.errors[0]);
                    }
                } else {
                    $window.location.reload();
                }
            });
        };
    };

    ng.module('smsConfirmationFormInit', [])
        .controller('SmsConfirmationChangeEmailCtrl', SmsConfirmationChangeEmailCtrl)
        .component('smsConfirmationChangeEmail', {
            templateUrl: 'modules/SmsConfirmation/content/scripts/changeEmail/templates/changeEmail.html',
            controller: 'SmsConfirmationChangeEmailCtrl',
            bindings: {
                email: '@'
            }
        });

    SmsConfirmationChangeEmailCtrl.$inject = ['$http', '$window', 'toaster'];

})(window.angular);