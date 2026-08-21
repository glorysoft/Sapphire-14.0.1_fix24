(function (ng) {
    

    const CustomersCtrl = function ($http, toaster) {
        const ctrl = this;
    };

    CustomersCtrl.$inject = ['$http', 'toaster'];

    ng.module('customers', []).controller('CustomersCtrl', CustomersCtrl);
})(window.angular);
