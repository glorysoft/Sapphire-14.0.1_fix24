(function (ng) {
    

    const exportfeedsService = function ($http, toaster) {
        const service = this;

        service.addCategoriesToExport = function (exportFeedId, categories) {
            return $http
                .post('exportfeeds/AddCategoriesToExport', {
                    exportFeedId,
                    categories,
                })
                .then((response) => response.data);
        };

        service.saveExportFeedFields = function (exportFeedId, exportFeedFields) {
            return $http
                .post('exportfeeds/SaveExportFeedFields', {
                    exportFeedId,
                    exportFeedFields,
                })
                .then((response) => response.data);
        };

        service.getCommonStatistic = function () {
            return $http.post('ExportImportCommon/GetCommonStatistic').then((response) => response.data);
        };

        service.deleteExport = function (exportFeedId) {
            return $http.post('exportfeeds/DeleteExport', { exportFeedId }).then((response) => response.data);
        };

        service.saveExportFeedSettings = function (exportFeedId, exportFeedName, exportFeedDescription, commonSettings, advancedSettings) {
            return $http
                .post('exportfeeds/SaveExportFeedSettings', {
                    exportFeedId,
                    exportFeedName,
                    exportFeedDescription,
                    commonSettings,
                    advancedSettings,
                })
                .then((response) => response.data);
        };

        service.deleteExportFile = function (exportFeedId, fileFullName) {
            return $http.post('exportfeeds/deleteExportFile', { exportFeedId, fileFullName }).then((response) => response.data);
        };

        service.getSaleChannel = function (type) {
            return $http.get('salesChannels/getItem', { params: { type } }).then((response) => response.data);
        };

        service.deleteSaleChannel = function (type) {
            return $http.post('salesChannels/delete', { type }).then((response) => response.data);
        };

        service.getWarehouses = function () {
            return $http.get('exportfeeds/getWarehouses').then((response) => response.data);
        };
    };

    exportfeedsService.$inject = ['$http', 'toaster'];

    ng.module('exportfeeds').service('exportfeedsService', exportfeedsService);
})(window.angular);
