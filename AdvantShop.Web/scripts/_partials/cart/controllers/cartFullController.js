import { PubSub } from '../../../_common/PubSub/PubSub.js';

(function (ng) {
    

    const CartFullCtrl = function ($rootScope, cartService, moduleService, SweetAlert, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            cartService.getData().then((data) => {
                ctrl.cartData = data;
            });

            ctrl.cssClassForPopoverHelpTrigger = 'cart-help-trigger-popover';

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

        ctrl.remove = function (event, shoppingCartItemId) {
            event?.preventDefault();
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

        ctrl.clear = function (event) {
            event.preventDefault();
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

        ctrl.refresh = function () {
            return cartService.getData(false, { fromCheckout: ctrl.isCheckout }).then((data) => {
                moduleService.update('fullcartmessage');
                ctrl.cartData = data;
            });
        };
    };

    angular.module('cart').controller('CartFullCtrl', CartFullCtrl);

    CartFullCtrl.$inject = ['$rootScope', 'cartService', 'moduleService', 'SweetAlert', '$translate'];
})(window.angular);
