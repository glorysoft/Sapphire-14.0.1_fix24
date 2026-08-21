(function (ng) {
    

    const mainpageproductsService = function ($http) {
        const service = this;

        service.addProducts = function (params) {
            return $http.post('mainpageproducts/addproducts', params).then((response) => response.data);
        };
    };

    mainpageproductsService.$inject = ['$http'];

    ng.module('mainpageproducts').service('mainpageproductsService', mainpageproductsService);
})(window.angular);
