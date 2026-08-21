(function (ng) {
    

    const triggersService = function ($http) {
        const service = this;

        service.getTrigger = function (id) {
            return $http.get('triggers/getTrigger', { params: { id } }).then((response) => response.data);
        };

        service.getTriggerFormData = function (eventType, objectTypes) {
            return $http.get('triggers/getTriggerFormData', { params: { eventType, objectTypes } }).then((response) => response.data);
        };

        service.getTriggerStatistics = function (triggerId) {
            return $http.get('triggers/getTriggerStatistics', { params: { triggerId } }).then((response) => response.data);
        };

        service.deleteTrigger = function (id) {
            return $http.post('triggers/deleteTrigger', { id }).then((response) => response.data);
        };

        service.saveName = function (id, name) {
            return $http.post('triggers/saveName', { id, name }).then((response) => response.data);
        };

        service.deleteTriggers = function () {
            return $http.post('salesChannels/delete', { type: 'Triggers' }).then((response) => response.data);
        };
    };

    triggersService.$inject = ['$http'];

    ng.module('triggers').service('triggersService', triggersService);
})(window.angular);
