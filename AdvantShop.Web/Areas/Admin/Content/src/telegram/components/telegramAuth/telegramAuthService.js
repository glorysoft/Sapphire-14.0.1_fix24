(function (ng) {
    

    const telegramAuthService = function ($http) {
        const service = this;

        service.getSettings = function () {
            return $http.get('telegram/getSettings').then((response) => response.data);
        };

        service.saveSettings = function (params) {
            return $http.post('telegram/saveSettings', params).then((response) => response.data);
        };

        service.deActivate = function () {
            return $http.post('telegram/deActivate').then((response) => response.data);
        };

        service.changeSalesFunnel = function (id) {
            return $http.post('telegram/changeSaleFunnel', { id }).then((response) => response.data);
        };
    };

    telegramAuthService.$inject = ['$http'];

    ng.module('telegramAuth').service('telegramAuthService', telegramAuthService);
})(window.angular);
