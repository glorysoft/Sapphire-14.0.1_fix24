(function (ng) {
    

    const productPropertiesService = function ($http) {
        const service = this;

        service.addPropertyWithValue = function (params) {
            return $http.post('product/AddPropertyWithValue', params).then((response) => response.data);
        };

        service.addPropertyValue = function (params) {
            return $http.post('product/addPropertyValue', params).then((response) => response.data);
        };

        service.removePropertyValue = function (params) {
            return $http.post('product/deletePropertyValue', params).then((response) => response.data);
        };

        service.findPropertyValue = function (propertyId, search) {
            return $http.get('product/getPropertyValues', { params: { propertyId, search } }).then((response) => response.data);
        };

        service.getCurrentProperties = function (productId) {
            return $http.get('product/getProperties', { params: { productId } }).then((response) => response.data);
        };

        service.getAllProperties = function (page, count, q) {
            return $http
                .get('product/getAllProperties', { params: { page, count, q } })
                .then((response) => response.data);
        };

        service.getAllPropertyValues = function (propertyId, page, count, q) {
            return $http
                .get('product/getAllPropertyValues', {
                    params: { propertyId, page, count, q },
                })
                .then((response) => response.data);
        };
    };

    productPropertiesService.$inject = ['$http'];

    ng.module('productProperties').service('productPropertiesService', productPropertiesService);
})(window.angular);
