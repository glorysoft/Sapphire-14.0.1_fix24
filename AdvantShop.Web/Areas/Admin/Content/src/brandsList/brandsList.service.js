(function (ng) {
    

    const brandsListService = function ($http) {
        const service = this;

        service.getBrands = function (params) {
            return $http.get('brands/getbrands', { params }).then((response) => response.data);
        };

        service.deleteBrands = function (brandIds) {
            return $http.post('brands/deletebrands', { brandIds }).then((response) => response.data);
        };
    };

    brandsListService.$inject = ['$http'];

    ng.module('brandsList').service('brandsListService', brandsListService);
})(window.angular);
