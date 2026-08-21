(function (ng) {
    

    const addressService = function ($http, $q, modalService) {
        const service = this;
    };

    ng.module('address').service('addressService', addressService);

    addressService.$inject = ['$http', '$q', 'modalService'];
})(window.angular);
