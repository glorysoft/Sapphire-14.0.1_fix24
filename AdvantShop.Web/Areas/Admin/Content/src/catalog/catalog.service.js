(function (ng) {
    

    const catalogService = function ($http) {
        const service = this;

        service.getCatalog = function (params) {
            return $http.get('catalog/getcatalog', { params }).then((response) => response.data);
        };

        service.getCategories = function (categoryId, categorysearch) {
            return $http
                .get('catalog/categorylistjson', { params: { categoryId, categorysearch } })
                .then((response) => response.data);
        };

        service.deleteCategories = function (categoryIds) {
            return $http.post('catalog/deletecategories', { categoryIds }).then((response) => response.data);
        };

        service.changeCategorySortOrder = function (categoryId, prevCategoryId, nextCategoryId, parentCategoryId) {
            return $http
                .post('catalog/changecategorysortorder', {
                    categoryId,
                    prevCategoryId,
                    nextCategoryId,
                    parentCategoryId,
                })
                .then((response) => response.data);
        };

        service.getDataProducts = function () {
            return $http.get('catalog/getdataproducts', { params: { rnd: Math.random() } }).then((response) => response.data);
        };

        //service.deleteCategory = function (categoryId, prevCategoryId, nextCategoryId, parentCategoryId) {
        //    return $http.post('catalog/changecategorysortorder', { categoryId: categoryId, prevCategoryId: prevCategoryId, nextCategoryId: nextCategoryId, parentCategoryId: parentCategoryId }).then(function (response) {
        //        return response.data;
        //    });
        //};
    };

    catalogService.$inject = ['$http'];

    ng.module('catalog').service('catalogService', catalogService);
})(window.angular);
