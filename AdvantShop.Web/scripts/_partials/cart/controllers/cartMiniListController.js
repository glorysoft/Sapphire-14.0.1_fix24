import { PubSub } from '../../../_common/PubSub/PubSub.js';

(function (ng) {
    



    /*@ngInject*/
    const CartMiniListCtrl = function (
        $element,
        $timeout,
        $window,
        $scope,
        cartService,
        cartConfig,
        domService,
        moduleService,
        SweetAlert,
        $translate,

    ) {
        let ctrl = this,
            timer;

        ctrl.$onInit = function () {
            ctrl.isPopup = ctrl.isPopup != null ? ctrl.isPopup() : true;
            ctrl.showEmptyCart = ctrl.showEmptyCart != null ? ctrl.showEmptyCart() : true;

            ctrl.isVisibleCart = ctrl.isPopup !== true || ctrl.isMobile;
            ctrl.isCartMiniFixed = false;
        };

        ctrl.updateAmount = function (value, itemId) {
            const item = {
                Key: itemId,
                Value: value,
            };

            cartService.updateAmount([item]).then(() => {
                moduleService.update('minicartmessage');
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
                        moduleService.update('minicartmessage');
                        PubSub.publish('cart.remove', result.offerId);
                    });
                }
            });
        };
    };

    angular.module('cart').controller('CartMiniListCtrl', CartMiniListCtrl);
})(angular);
