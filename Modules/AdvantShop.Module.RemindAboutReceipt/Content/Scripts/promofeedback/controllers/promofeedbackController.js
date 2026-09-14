; (function (ng) {

    'use strict';

    var PROMOFeedbackCtrl = function ($http, toaster) {
        var ctrl = this;

        ctrl.$onInit = function () {
            ctrl.feedback = JSON.parse(ctrl.feedbackString);
        }

        ctrl.send = function (form) {
            if (form.$valid)
            {
                $http.post('../module/raradmin/feedback', { feedback: ctrl.feedback }).then(function (response) {
                    var success = response.data.success;
                    var type = success ? 'success' : 'error';
                    toaster.pop(type, '', response.data.msg);
                    if (success)
                    {
                        ctrl.feedback = JSON.parse(ctrl.feedbackString);
                        form.$setPristine();
                        form.$setUntouched();
                    }
                });
            }
        }
    }

    PROMOFeedbackCtrl.$inject = ['$http', 'toaster'];

    ng.module('promofeedback',[])
        .controller('PROMOFeedbackCtrl', PROMOFeedbackCtrl)
        .component('promoFeedback', {
            templateUrl: '../modules/RemindAboutReceipt/content/scripts/promofeedback/templates/promofeedback.html',
            controller: 'PROMOFeedbackCtrl',
            bindings: {
                feedbackString: '@'
            }
        });

})(window.angular);