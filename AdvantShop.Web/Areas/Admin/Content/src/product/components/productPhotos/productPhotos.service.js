(function (ng) {
    

    const productPhotosService = function ($http) {
        const service = this;

        service.getPhotos = function (productId) {
            return $http.get('product/getPhotos', { params: { productId } }).then((response) => response.data);
        };

        service.getPhotoColors = function (productId) {
            return $http.get('product/getPhotoColors', { params: { productId } }).then((response) => response.data);
        };

        service.getPhotoCategories = function () {
            return $http.get('product/getPhotoCategories').then((response) => response.data);
        };

        service.deletePhoto = function (photoId) {
            return $http.post('product/deletePhoto', { photoId }).then((response) => response.data);
        };

        service.deletePhotos = function (ids) {
            return $http.post('product/deletePhotos', { photoIds: ids }).then((response) => response.data);
        };

        service.editPhoto = function (photoId, alt, colorId) {
            return $http.post('product/editPhoto', { photoId, alt, colorId }).then((response) => response.data);
        };

        service.changePhotoColor = function (photoId, colorId) {
            return $http.post('product/changePhotoColor', { photoId, colorId }).then((response) => response.data);
        };

        service.changePhotoCategory = function (photoId, photoCategoryId) {
            return $http.post('product/changePhotoCategory', { photoId, photoCategoryId }).then((response) => response.data);
        };

        service.changeMainPhoto = function (photoId) {
            return $http.post('product/changeMainPhoto', { photoId }).then((response) => response.data);
        };

        service.changePhotoSortOrder = function (productId, photoId, prevPhotoId, nextPhotoId) {
            return $http
                .post('product/changePhotoSortOrder', {
                    productId,
                    photoId,
                    prevPhotoId,
                    nextPhotoId,
                })
                .then((response) => response.data);
        };

        service.uploadPhoto = function (productId, fileLink) {
            return $http.post('product/uploadPictureByLink', { productId, fileLink }).then((response) => response.data);
        };

        service.uploadListPhoto = function (productId, fileLinks) {
            return $http.post('product/uploadPicturesByLink', { productId, fileLinks }).then((response) => response.data);
        };
    };

    productPhotosService.$inject = ['$http'];

    ng.module('productPhotos').service('productPhotosService', productPhotosService);
})(window.angular);
