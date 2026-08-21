(function(ng) {
    


    /*@ngInject*/
    const CartMiniCtrl = function(cartService, cartConfig) {
        const ctrl = this;

        ctrl.$onInit = function() {
            ctrl.cartData = {};

            cartService.getData().then((data) => {
                ctrl.cartData = data;
            });
        };

        ctrl.addMinicartList = function(miniCartList) {
            ctrl.list = miniCartList;
        };

        ctrl.triggerClick = function(event) {
            if (event != null) {
                event.preventDefault();
            }

            cartService.processCallback(cartConfig.callbackNames.open);
        };
    };

    angular.module('cart').controller('CartMiniCtrl', CartMiniCtrl);

})(angular);
