(function (ng) {
    

    angular.module('cookiesPolicy').directive('cookiesPolicyModal', () => ({
            restrict: 'A',
            scope: true,
            controller: 'CookiesPolicyCtrl',
            controllerAs: 'cookiesPolicy',
            bindToController: true,
            link (scope, elem, attrs, ctrl) {
                ctrl.cookieName = attrs.cookieName;
            },
        }));
})(window.angular);
