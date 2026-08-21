(function (ng) {
    

    const settingsSystemLogsService = function ($http) {
        const service = this;

        service.getLogs = function (type, page) {
            return $http.get('logErrors/getLogErrors', { params: { type, page } }).then((response) => response.data);
        };

        service.getLogsItem = function (type, datetime, page) {
            return $http.get('logErrors/getItemLogError', { params: { type, time: datetime, page } }).then((response) => response.data);
        };

        service.getSchedulerJobs = function () {
            return $http.get('settingsSystem/getSchedulerJobs').then((response) => response.data);
        };

        service.removeLogs = function (type) {
            return $http.post('logErrors/removeLogs', { type }).then((response) => response.data);
        };
    };

    settingsSystemLogsService.$inject = ['$http'];

    ng.module('settingsSystem').service('settingsSystemLogsService', settingsSystemLogsService);
})(window.angular);
