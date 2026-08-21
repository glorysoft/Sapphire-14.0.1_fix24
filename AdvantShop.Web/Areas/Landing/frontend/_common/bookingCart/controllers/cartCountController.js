(function (ng) {
    

    const CartCountCtrl = function ($filter, bookingCartService) {
        const ctrl = this;

        bookingCartService.getData().then((data) => {
            ctrl.cartData = data;
        });

        ctrl.getValue = function () {
            let result;

            if (ctrl.cartData == null || ctrl.cartData.result === false) {
                result = ctrl.startValue;
            } else {
                switch (ctrl.type) {
                    case 'count':
                        result = ctrl.cartData.obj.Count;
                        break;
                    default:
                        result = $filter('number')(ctrl.cartData.obj.TotalItems);
                }
            }
            return result;
        };
    };

    ng.module('bookingCart').controller('BookingCartCountCtrl', CartCountCtrl);

    CartCountCtrl.$inject = ['$filter', 'bookingCartService'];
})(window.angular);
