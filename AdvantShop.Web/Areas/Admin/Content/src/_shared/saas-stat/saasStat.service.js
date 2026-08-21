(function (ng) {
    

    const saasStatService = function SaasStatCTrl($http, $timeout) {
        let service = this,
            isRuning = null,
            countObsevarable = 0,
            data = {};

        service.getData = function getData() {
            countObsevarable += 1;

            $http.get('ExportImportCommon/GetSaasBlockInformation').then((response) => ng.extend(data, response.data));

            //var isSaas = false;

            //if (service.getIsSaas() && isRuning === null) {
            if (isRuning === null) {
                isRuning = true;

                service.startPooling();
            }

            return data;
        };

        service.makeRequest = function makeRequest() {
            return $http.get('ExportImportCommon/GetSaasBlockInformation').then((response) => {
                if (response.data.isSaas === false) {
                    service.deleteObsevarable();
                }
                return ng.extend(data, response.data);
            });
        };

        service.startPooling = function startPooling() {
            service.makeRequest().then(() => $timeout(() => {
                    if (isRuning === true && countObsevarable > 0) {
                        service.startPooling();
                    }
                }, 1000));
        };

        service.stopPooling = function stopPooling() {
            isRuning = false;
        };

        service.getIsSaas = function getIsSaas() {
            return $http.get('ExportImportCommon/GetSaasBlockInformation').then((response) => response.data.isSaas);
        };

        service.deleteObsevarable = function deleteObsevarable() {
            countObsevarable -= 1;
        };
    };

    saasStatService.$inject = ['$http', '$timeout'];

    ng.module('saasStat').service('saasStatService', saasStatService);
})(window.angular);
