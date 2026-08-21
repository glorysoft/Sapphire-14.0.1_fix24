(function (ng) {
    

    const importService = function ($http) {
        const service = this;

        service.UploadProductFiles = function (exportFeedId, categories) {
            return $http.post('import/uploadproductfiles').then((response) => response.data);
        };

        service.getFieldsFromCsvFile = function (importSettings) {
            return $http.post('import/GetFieldsFromCsvFile', importSettings).then((response) => response.data);
        };

        service.getFieldsFromCategoriesCsvFile = function (importSettings) {
            return $http.post('import/GetFieldsFromCategoriesCsvFile', importSettings).then((response) => response.data);
        };

        service.getFieldsFromCustomersCsvFile = function (importSettings) {
            return $http.post('import/GetFieldsFromCustomersCsvFile', importSettings).then((response) => response.data);
        };

        service.getFieldsFromLeadsCsvFile = function (importSettings) {
            return $http.post('import/GetFieldsFromLeadsCsvFile', importSettings).then((response) => response.data);
        };

        service.getFieldsFromBrandsCsvFile = function (importSettings) {
            return $http.post('import/GetFieldsFromBrandsCsvFile', importSettings).then((response) => response.data);
        };

        service.getFieldsFromOrdersCsvFile = function (importSettings) {
            return $http.post('import/GetFieldsFromOrdersCsvFile', importSettings).then((response) => response.data);
        };

        service.startProductsImport = function (importSettings) {
            return $http.post('import/StartProductsImport', importSettings).then((response) => response.data);
        };

        service.startCategoriesImport = function (importSettings) {
            return $http.post('import/StartCategoriesImport', importSettings).then((response) => response.data);
        };

        service.startCustomersImport = function (importSettings) {
            return $http.post('import/StartCustomersImport', importSettings).then((response) => response.data);
        };

        service.startLeadsImport = function (importSettings) {
            return $http.post('import/StartLeadsImport', importSettings).then((response) => response.data);
        };

        service.startBrandsImport = function (importSettings) {
            return $http.post('import/StartBrandsImport', importSettings).then((response) => response.data);
        };

        service.startOrdersImport = function (importSettings) {
            return $http.post('import/StartOrdersImport', importSettings).then((response) => response.data);
        };

        //service.getSaasBlockInformation = function () {
        //    return $http.post('import/GetSaasBlockInformation').then(function (response) {
        //        return response.data;
        //    });
        //};

        service.abortImport = function () {
            return $http.post('ExportImportCommon/InterruptProcess').then((response) => response.data);
        };

        //service.getCommonStatistic = function () {
        //    return $http.post('ExportImportCommon/GetCommonStatistic').then(function (response) {
        //        return response.data;
        //    });
        //};

        service.getLogFile = function () {
            $http({
                url: 'ExportImportCommon/GetLogFile',
                method: 'POST',
                params: {},
                headers: {
                    'Content-type': 'application/txt',
                },
                responseType: 'arraybuffer',
            })
                .then((response) => {
                    const file = new Blob([response.data], {
                        type: 'application/txt',
                    });
                    //trick to download store a file having its URL
                    const fileURL = URL.createObjectURL(file);
                    const a = document.createElement('a');
                    a.href = fileURL;
                    a.target = '_blank';
                    a.download = 'errlog.txt';
                    document.body.appendChild(a);
                    a.click();
                })
                .catch((response) => {});
        };

        service.getExampleCustomersFile = function (importSettings) {
            $http({
                url: 'import/getExampleCustomersFile',
                method: 'POST',
                params: importSettings,
                headers: {
                    'Content-type': 'application/txt',
                },
                responseType: 'arraybuffer',
            })
                .then((response) => {
                    const file = new Blob([response.data], {
                        type: 'application/txt',
                    });
                    //trick to download store a file having its URL
                    const fileURL = URL.createObjectURL(file);
                    const a = document.createElement('a');
                    a.href = fileURL;
                    a.target = '_blank';
                    a.download = 'exampleCustomersFile.csv';
                    document.body.appendChild(a);
                    a.click();
                })
                .catch((response) => {});
        };

        service.getExampleLeadsFile = function (importSettings) {
            $http({
                url: 'import/getExampleLeadsFile',
                method: 'POST',
                params: importSettings,
                headers: {
                    'Content-type': 'application/txt',
                },
                responseType: 'arraybuffer',
            })
                .then((response) => {
                    const file = new Blob([response.data], {
                        type: 'application/txt',
                    });
                    //trick to download store a file having its URL
                    const fileURL = URL.createObjectURL(file);
                    const a = document.createElement('a');
                    a.href = fileURL;
                    a.target = '_blank';
                    a.download = 'exampleLeadsFile.csv';
                    document.body.appendChild(a);
                    a.click();
                })
                .catch((response) => {});
        };

        service.getExampleBrandsFile = function (importSettings) {
            $http({
                url: 'import/getExampleBrandsFile',
                method: 'POST',
                params: importSettings,
                headers: {
                    'Content-type': 'application/txt',
                },
                responseType: 'arraybuffer',
            })
                .then((response) => {
                    const file = new Blob([response.data], {
                        type: 'application/txt',
                    });
                    //trick to download store a file having its URL
                    const fileURL = URL.createObjectURL(file);
                    const a = document.createElement('a');
                    a.href = fileURL;
                    a.target = '_blank';
                    a.download = 'exampleBrandsFile.csv';
                    document.body.appendChild(a);
                    a.click();
                })
                .catch((response) => {});
        };

        service.getExampleOrdersFile = function (importSettings) {
            $http({
                url: 'import/getExampleOrdersFile',
                method: 'POST',
                params: importSettings,
                headers: {
                    'Content-type': 'application/txt',
                },
                responseType: 'arraybuffer',
            })
                .then((response) => {
                    const file = new Blob([response.data], {
                        type: 'application/txt',
                    });
                    //trick to download store a file having its URL
                    const fileURL = URL.createObjectURL(file);
                    const a = document.createElement('a');
                    a.href = fileURL;
                    a.target = '_blank';
                    a.download = 'exampleOrdersFile.csv';
                    document.body.appendChild(a);
                    a.click();
                })
                .catch((response) => {});
        };
    };

    importService.$inject = ['$http'];

    ng.module('import').service('importService', importService);
})(window.angular);
