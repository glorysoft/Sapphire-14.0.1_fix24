(function (ng) {
    

    const productPickerService = function ($http) {
        const service = this;

        service.geProductsByCategory = function (url, categoryId) {
            return $http.get(url, { params: { categoryId } }).then((response) => response.data);
        };
    };

    ng.module('productPicker').service('productPickerService', productPickerService);

    productPickerService.$inject = ['$http'];
})(window.angular);
