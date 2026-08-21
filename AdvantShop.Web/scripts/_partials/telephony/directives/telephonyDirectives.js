(function (ng) {
    

    angular.module('telephony').directive('telephonyForm', () => ({
            restrict: 'A',
            scope: true,
            controller: 'TelephonyFormCtrl',
            controllerAs: 'telephonyForm',
            bindToController: true,
        }));
})(window.angular);
