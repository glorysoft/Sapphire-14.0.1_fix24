(function (ng) {
    const CookiesPolicyCtrl = function ($cookies, advCacheService) {
        const ctrl = this;

        ctrl.accept = function () {
            ctrl.accepted = true;
            $cookies.put(ctrl.cookieName, 'true');
            ctrl.resetLastModified().catch((error) => {
                console.error(error);
            });
        };

        ctrl.resetLastModified = () => advCacheService.resetLastModified();
    };

    angular.module('cookiesPolicy').controller('CookiesPolicyCtrl', CookiesPolicyCtrl);

    CookiesPolicyCtrl.$inject = ['$cookies', 'advCacheService'];
})(window.angular);
