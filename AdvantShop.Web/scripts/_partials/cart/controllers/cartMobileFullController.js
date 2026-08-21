import { PubSub } from '../../../_common/PubSub/PubSub.js';

(function (ng) {
    

    const CartMobileFullCtrl = function ($rootScope, cartService, moduleService, SweetAlert, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            cartService.getData().then((data) => {
                ctrl.cartData = data;
            });

            if (ctrl.onInit != null) {
                ctrl.onInit({cart: ctrl});
            }
        };

        ctrl.updateAmount = function (value, itemId) {
            const item = {
                Key: itemId,
                Value: value,
            };

            cartService.updateAmount([item]).then(() => {
                moduleService.update('fullcartmessage');
                PubSub.publish('cart.updateAmount');
            });
        };

        ctrl.remove = function (shoppingCartItemId) {
            SweetAlert.confirm($translate.instant('Js.Cart.Removing.AreYouSureDelete'), {
                title: $translate.instant('Js.Cart.Removing'),
                cancelButtonText: $translate.instant('Js.ClearCart.Cancel'),
            }).then((result) => {
                if (result.isConfirmed) {
                    cartService.removeItem(shoppingCartItemId).then((result) => {
                        moduleService.update('fullcartmessage');
                        PubSub.publish('cart.remove', result.offerId);
                    });
                }
            });
        };

        ctrl.clear = function () {
            SweetAlert.confirm($translate.instant('Js.Cart.Clear.AreYouSureClear'), {
                title: $translate.instant('Js.Cart.Warning.Clear.Title'),
                cancelButtonText: $translate.instant('Js.ClearCart.Cancel'),
            }).then((result) => {
                if (result.isConfirmed) {
                    cartService.clear().then(() => {
                        moduleService.update('fullcartmessage');
                        PubSub.publish('cart.clear');
                    });
                }
            });
        };

        ctrl.getOptions = function (min, step, amount, max) {
            const tempArr = [];

            const start = Math.ceil(min / step) * step;

            if (amount > max) {
                //if you need limit options number by availability
                for (let i = start; i <= amount; i = +(i + step).toFixed(4)) {
                    tempArr.push(i);
                }
            } else {
                for (let i = start; i <= max; i = +(i + step).toFixed(4)) {
                    tempArr.push(i);
                }
            }

            return tempArr;
        };

        ctrl.refresh = function () {
            return cartService.getData(false, { fromCheckout: ctrl.isCheckout }).then((data) => {
                ctrl.cartData = data;
            });
        };
    };

    angular.module('cart').controller('CartMobileFullCtrl', CartMobileFullCtrl);

    CartMobileFullCtrl.$inject = ['$rootScope', 'cartService', 'moduleService', 'SweetAlert', '$translate'];
})(window.angular);
