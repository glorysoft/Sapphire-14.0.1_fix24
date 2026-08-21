(function (ng) {
    

    const CartCountCtrl = function ($filter, cartService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            cartService.getData().then((data) => {
                ctrl.cartData = data;
            });
        };

        ctrl.getValue = function () {
            let result;

            if (ctrl.cartData == null) {
                result = ctrl.startValue;
            } else {
                switch (ctrl.type) {
                    case 'count':
                        result = ctrl.cartData.Count;
                        break;
                    case 'totalPrice':
                        result = ctrl.cartData.TotalPrice;
                        break;
                    default:
                        result = $filter('number')(ctrl.cartData.TotalItems);
                }
            }
            return result;
        };
    };

    angular.module('cart').controller('CartCountCtrl', CartCountCtrl);

    CartCountCtrl.$inject = ['$filter', 'cartService'];
})(angular);
