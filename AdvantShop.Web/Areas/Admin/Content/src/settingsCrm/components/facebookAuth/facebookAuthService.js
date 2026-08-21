(function (ng) {
    

    const facebookAuthService = function ($http) {
        const service = this;

        service.getSettings = function () {
            return $http.get('facebook/getSettings').then((response) => response.data);
        };

        service.saveAuthUser = function (params) {
            return $http.post('facebook/saveAuthUser', params).then((response) => response.data);
        };

        service.saveGroupToken = function (params) {
            return $http.post('facebook/saveGroupToken', params).then((response) => response.data);
        };

        service.deleteGroup = function (params) {
            return $http.post('facebook/deleteGroup', params).then((response) => response.data);
        };

        service.saveSettings = function (id, createLeadFromMessages, createLeadFromComments) {
            return $http
                .post('facebook/saveSettings', {
                    id,
                    createLeadFromMessages,
                    createLeadFromComments,
                })
                .then((response) => response.data);
        };
    };

    facebookAuthService.$inject = ['$http'];

    ng.module('facebookAuth').service('facebookAuthService', facebookAuthService);
})(window.angular);
