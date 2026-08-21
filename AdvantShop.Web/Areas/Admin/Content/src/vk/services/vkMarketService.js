(function (ng) {
    

    const vkMarketService = function ($http) {
        const service = this;

        service.getAuthSettings = function () {
            return $http.get('vkMarket/getAuthSettings').then((response) => response.data);
        };

        service.saveAuth = function (params) {
            return $http.post('vkMarket/saveAuth', params).then((response) => params);
        };

        service.getGroups = function () {
            return $http.get('vkMarket/getGroups').then((response) => response.data);
        };

        service.saveGroup = function (params) {
            return $http.post('vkMarket/saveGroup', params).then((response) => response.data != null ? response.data.obj : null);
        };

        service.deleteGroup = function () {
            return $http.post('vkMarket/deleteGroup').then((response) => response.data);
        };

        service.getExportSettings = function () {
            return $http.get('vkMarket/getExportSettings').then((response) => response.data);
        };

        service.saveExportSettings = function (params) {
            return $http.post('vkMarket/saveExportSettings', params).then((response) => response.data);
        };

        service.export = function () {
            return $http.post('vkMarket/export').then((response) => response.data);
        };

        service.getExportProgress = function () {
            return $http.get('vkMarket/getExportProgress').then((response) => response.data);
        };

        service.import = function (settings) {
            return $http.post('vkMarket/importProducts', settings).then((response) => response.data);
        };

        service.getImportProgress = function () {
            return $http.get('vkMarket/getImportProgress').then((response) => response.data);
        };

        service.getReports = function () {
            return $http.get('vkMarket/getReports').then((response) => response.data);
        };

        service.deleteAllProducts = function () {
            return $http.post('vkMarket/deleteAllProducts').then((response) => response.data);
        };
    };

    vkMarketService.$inject = ['$http'];

    ng.module('vkMarket', []).service('vkMarketService', vkMarketService);
})(window.angular);
