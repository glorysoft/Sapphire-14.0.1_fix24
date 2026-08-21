(function (ng) {
    

    const okService = function ($http) {
        const service = this;

        service.removeChannel = function () {
            return $http.post('salesChannels/delete', { type: 'ok' }).then((response) => response.data);
        };

        service.getOkSettings = function () {
            return $http.get('ok/getOkSettings').then((response) => response.data);
        };

        service.validatePrimarySettings = function (params) {
            return $http.post('ok/validatePrimarySettings', params).then((response) => response.data);
        };

        service.changeMarketGroup = function (params) {
            return $http.post('ok/changeMarketGroup', params).then((response) => response.data);
        };

        service.removeBinding = function () {
            return $http.post('ok/removeBinding').then((response) => response.data);
        };

        service.changeSaleFunnel = function (params) {
            return $http.post('ok/changeSaleFunnel', params).then((response) => response.data);
        };

        service.toggleSubscriptionToMessages = function (subscribe) {
            return $http.post('ok/toggleSubscriptionToMessages', { subscribe }).then((response) => response.data);
        };
    };

    okService.$inject = ['$http'];

    ng.module('okChannel').service('okService', okService);
})(window.angular);
