(function (ng) {
    

    const productService = function ($http) {
        const service = this;

        service.getColors = function () {
            return $http.get('product/getcolors').then((response) => response.data);
        };

        service.getSizes = function (categoryId, productId) {
            return $http.get('product/getsizes', { params: { categoryId, productId } }).then((response) => response.data);
        };

        service.getOffer = function (offerId) {
            return $http.get('product/getoffer', { params: { offerId } }).then((response) => response.data);
        };

        service.getAvailableArtNo = function (productId) {
            return $http.get('product/getavailableartno', { params: { productId } }).then((response) => response.data);
        };

        service.getProductInfoForOffer = function (productId) {
            return $http.get('product/getProductInfoForOffer', { params: { productId } }).then((response) => response.data);
        };

        service.addOffer = function (params) {
            return $http.post('product/addoffer', params).then((response) => response.data);
        };

        service.updateOffer = function (params) {
            return $http.post('product/updateoffer', params).then((response) => response.data);
        };

        service.getPriceRulesInfo = function () {
            return $http.get('pricerules/getInfo').then((response) => response.data);
        };

        service.getProductLastModified = function (productId) {
            return $http.get('product/getProductLastModified', { params: { productId } }).then((response) => response.data);
        };

        service.getOfferStocks = function (offerId) {
            return $http.get('product/getOfferStocks', { params: { offerId } }).then((response) => response.data);
        };

        service.saveOfferStocks = function (params) {
            return $http.post('product/saveOfferStocks', params).then((response) => response.data);
        };
    };

    productService.$inject = ['$http'];

    ng.module('product').service('productService', productService);
})(window.angular);
