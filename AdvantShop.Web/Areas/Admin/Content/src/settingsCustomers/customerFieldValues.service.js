(function (ng) {
    

    const customerFieldValuesService = function ($http) {
        const service = this;

        service.getCustomerFieldValue = function (id) {
            return $http.post('customerFieldValues/get', { id, rnd: Math.random() }).then((response) => response.data);
        };

        service.deleteCustomerFieldValue = function (id) {
            return $http.post('customerFieldValues/delete', { id }).then((response) => response.data);
        };

        service.addOrUpdateCustomerFieldValue = function (add, params) {
            const url = add === true ? 'customerFieldValues/add' : 'customerFieldValues/update';
            return $http.post(url, params).then((response) => response.data);
        };
    };

    customerFieldValuesService.$inject = ['$http'];

    ng.module('settingsCustomers').service('customerFieldValuesService', customerFieldValuesService);
})(window.angular);
