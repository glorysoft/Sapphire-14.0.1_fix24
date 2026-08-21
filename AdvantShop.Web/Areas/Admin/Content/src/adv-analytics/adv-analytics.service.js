(function (ng) {
    

    const analyticsService = function ($http) {
        const service = this;

        service.exportOrders = function (settings) {
            return $http.post('analytics/exportorders', { settings }).then((response) => response.data);
        };

        service.exportCustomers = function (settings) {
            return $http.post('analytics/exportcustomers', { settings }).then((response) => response.data);
        };

        service.exportProducts = function (settings) {
            return $http.post('analytics/exportproducts', { settings }).then((response) => response.data);
        };

        service.getCommonStatistic = function () {
            return $http.post('ExportImportCommon/GetCommonStatistic').then((response) => response.data);
        };
    };

    analyticsService.$inject = ['$http'];

    ng.module('analytics').service('analyticsService', analyticsService);
})(window.angular);
