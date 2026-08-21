(function (ng) {
    

    const adminCommentsService = function ($http) {
        const service = this;

        service.getComments = function (objId, type) {
            return $http.get('adminComments/getComments', { params: { objId, type } }).then((response) => response.data);
        };

        service.deleteComment = function (id) {
            return $http.post('adminComments/delete', { id }).then((response) => response.data);
        };

        service.addComment = function (objId, type, parentId, text, objUrl) {
            return $http
                .post('adminComments/add', { objId, type, text, parentId, objUrl })
                .then((response) => response.data);
        };

        service.updateComment = function (id, text) {
            return $http.post('adminComments/update', { id, text }).then((response) => response.data);
        };
    };

    adminCommentsService.$inject = ['$http'];

    ng.module('adminComments').service('adminCommentsService', adminCommentsService);
})(window.angular);
