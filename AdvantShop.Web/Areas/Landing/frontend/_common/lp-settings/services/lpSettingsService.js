(function (ng) {
    

    const lpSettingsService = function ($http, $q) {
        const service = this;

        service.get = function (lpId) {
            return $http.get('landing/landingInplace/getSettings', { params: { lpId, rnd: Math.random() } }).then((response) => response.data);
        };
    };

    ng.module('lpSettings').service('lpSettingsService', lpSettingsService);

    lpSettingsService.$inject = ['$http', '$q'];
})(window.angular);
