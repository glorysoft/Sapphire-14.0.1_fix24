(function (ng) {
    

    const bookingCategoriesService = function ($http) {
        const service = this;

        service.getCategories = function () {
            return $http.get('bookingCategory/getListCategories').then((result) => result.data);
        };

        service.getCategoriesRefAffiliate = function (affiliateId) {
            return $http.get('bookingCategory/getListCategoriesRefAffiliate', { params: { affiliateId } }).then((result) => result.data);
        };

        service.changeCategorySorting = function (categoryId, prevCategoryId, nextCategoryId) {
            return $http
                .post('bookingCategory/changeCategorySorting', {
                    categoryId,
                    prevCategoryId,
                    nextCategoryId,
                })
                .then((result) => result.data);
        };

        service.deleteCategory = function (categoryId) {
            return $http.post('bookingCategory/deleteCategory', { categoryId }).then((response) => response.data);
        };
    };

    bookingCategoriesService.$inject = ['$http'];

    ng.module('bookingCategories').service('bookingCategoriesService', bookingCategoriesService);
})(window.angular);
