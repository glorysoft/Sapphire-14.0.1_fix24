(function (ng) {
    

    const okMarketService = function ($http) {
        const service = this;

        service.getExportSettings = function () {
            return $http.get('okmarket/getExportSettings').then((response) => response.data);
        };

        service.saveExportSettings = function (params) {
            return $http.post('okmarket/saveExportSettings', params).then((response) => response.data);
        };

        service.export = function () {
            return $http.post('okmarket/Export').then((response) => response.data);
        };

        service.getExportProgress = function () {
            return $http.get('okmarket/getExportProgress').then((response) => response.data);
        };

        service.getExportReports = function () {
            return $http.get('okmarket/getExportReports').then((response) => response.data);
        };

        service.getExportState = function () {
            return $http.get('okmarket/getExportState').then((response) => response.data);
        };

        service.importProducts = function () {
            return $http.post('okmarket/importProducts').then((response) => response.data);
        };

        service.getImportProgress = function () {
            return $http.get('okmarket/getImportProgress').then((response) => response.data);
        };

        service.getImportReports = function () {
            return $http.get('okmarket/getImportReports').then((response) => response.data);
        };

        service.getImportState = function () {
            return $http.get('okmarket/getImportState').then((response) => response.data);
        };

        service.getDeleteState = function () {
            return $http.get('okmarket/getDeleteState').then((response) => response.data);
        };
    };

    okMarketService.$inject = ['$http'];

    ng.module('okMarketExport').service('okMarketService', okMarketService);
})(window.angular);
