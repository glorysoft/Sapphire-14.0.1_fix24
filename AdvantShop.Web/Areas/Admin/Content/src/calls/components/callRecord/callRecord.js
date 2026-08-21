import callRecordTemplate from './callRecord.html';
(function (ng) {
    

    const CallRecordCtrl = function ($http) {
        const ctrl = this;
        ctrl.$onInit = function () {};
        ctrl.getRecordLink = function () {
            const timer = setTimeout(() => {
                ctrl.loading = true;
            }, 200);
            return $http
                .post('calls/getRecordLink', {
                    callId: ctrl.callId,
                    type: ctrl.operatorType,
                })
                .then((response) => {
                    clearTimeout(timer);
                    ctrl.loading = false;
                    return response.data != null ? response.data.link : '';
                });
        };
    };
    CallRecordCtrl.$inject = ['$http'];
    ng.module('callRecord', [])
        .controller('CallRecordCtrl', CallRecordCtrl)
        .component('callRecord', {
            templateUrl: callRecordTemplate,
            controller: CallRecordCtrl,
            bindings: {
                callId: '<',
                operatorType: '<',
            },
        });
})(window.angular);
