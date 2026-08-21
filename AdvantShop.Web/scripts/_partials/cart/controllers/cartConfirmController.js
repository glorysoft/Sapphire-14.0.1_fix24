(function (ng) {
    

    const CartConfirmCtrl = function (cartService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.cartData = {};

            cartService.getData().then((data) => {
                ctrl.cartData = data;
            });
        };
    };

    angular.module('cart').controller('CartConfirmCtrl', CartConfirmCtrl);

    CartConfirmCtrl.$inject = ['cartService'];
})(angular);
