//#region module
import cacheModule from '../_common/cache/cache.module.js';

(function (ng) {
    angular.module('mobileOverlap', ['ngCookies', 'urlHelper', cacheModule]);
})(window.angular);

//#endregion

//#region controller

(function (ng) {
    const mobileOverlapCtrl = function ($location, $cookies, $timeout, advCacheService) {
        const ctrl = this;

        ctrl.goToDesktop = function (name, value) {
            // $cookies.remove('deviceMode');
            // $cookies.put('deviceMode', 'desktop');
            if (name != null && value != null) {
                $cookies.remove(name);
                $cookies.put(name, value);
                ctrl.resetLastModified()
                    .then((data) => {
                        // window.location = $location.absUrl();
                        location.reload(true);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        };

        ctrl.goToMobile = function (name, value) {
            // $cookies.remove('deviceMode');
            // $cookies.put('deviceMode', 'mobile');
            $cookies.remove(name);
            $cookies.put(name, value);
            ctrl.resetLastModified()
                .then((data) => {
                    location.reload(true);
                    // window.location = $location.absUrl();
                })
                .catch((error) => {
                    console.error(error);
                });
        };

        ctrl.stayOnDesktop = function (name, value) {
            $cookies.put(name, value);
            document.documentElement.classList.remove('mobile-redirect-panel');
            //$element.remove();
        };

        ctrl.stayOnMobile = function (name, value) {
            $cookies.put(name, value);
            document.documentElement.classList.remove('desktop-redirect-panel');
            //$element.remove();
        };

        ctrl.resetLastModified = function () {
            //чистим cache
            return advCacheService.resetLastModified();
        };
    };

    angular.module('mobileOverlap').controller('mobileOverlapCtrl', mobileOverlapCtrl);

    mobileOverlapCtrl.$inject = ['$location', '$cookies', '$timeout', 'advCacheService'];
})(window.angular);

//#endregion
