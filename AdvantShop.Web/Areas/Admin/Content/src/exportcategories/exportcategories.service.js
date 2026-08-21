(function (ng) {
    

    const exportCategoriesService = function ($http) {
        const service = this;

        service.getCommonStatistic = function () {
            return $http.post('ExportImportCommon/GetCommonStatistic').then((response) => response.data);
        };

        service.interruptProcess = function () {
            return $http.post('ExportImportCommon/InterruptProcess').then((response) => response.data);
        };
    };

    exportCategoriesService.$inject = ['$http'];

    ng.module('exportCategories').service('exportCategoriesService', exportCategoriesService);
})(window.angular);
