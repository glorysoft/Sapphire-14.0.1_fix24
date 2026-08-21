
(function (ng) {
    


    /*@ngInject*/
    const CartMiniPopupCtrl = function (
        $element,
        $timeout,
        $window,
        $scope,
        cartService,
        cartConfig,
        domService,
    ) {
        let ctrl = this,
            timer;

        ctrl.$onInit = function () {
            ctrl.isPopup = ctrl.isPopup != null ? ctrl.isPopup() : true;
            ctrl.showEmptyCart = ctrl.showEmptyCart != null ? ctrl.showEmptyCart() : true;

            ctrl.isVisibleCart = ctrl.isPopup !== true || ctrl.isMobile;
            ctrl.isCartMiniFixed = false;

            cartService.subscribeCartMini(() => {
                ctrl.cartOpen()
            }, 'cartMini')

        };

        ctrl.cartOpen = function (startTime) {
            if (startTime == null) {
                startTime = true;
            }

            ctrl.isVisibleCart = true;

            ctrl.saveStartPosition();

            if (startTime === true) {
                ctrl.startTimerClose();
            }
        };

        ctrl.saveStartPosition = function () {
            $timeout(() => {
                const offset = $element[0].children[0].getBoundingClientRect();

                ctrl.staticPosition = {
                    top: offset.top,
                    left: offset.left,
                    width: offset.width,
                };

                //if (ctrl.staticPosition.top < 0) {
                ctrl.staticPosition.top += $window.pageYOffset;
                //}

                ctrl.checkFixed();
            }, 100);
        };

        ctrl.cartClose = function () {
            ctrl.isCartMiniFixed = false;

            ctrl.isVisibleCart = false;

            ctrl.clearTimerClose();
        };

        ctrl.cartToggle = function (startTime) {
            ctrl.isVisibleCart === true ? ctrl.cartClose() : ctrl.cartOpen(startTime);
        };

        ctrl.cartMouseEnter = function () {
            ctrl.clearTimerClose();
        };

        ctrl.cartMouseLeave = function (event) {
            ctrl.startTimerClose();
        };

        ctrl.checkVisibleCart = function () {
            return ctrl.isVisibleCart === true && (ctrl.showEmptyCart === false ? ctrl.cartData.TotalItems > 0 : true);
        };

        ctrl.windowScroll = function (event) {
            if (ctrl.checkVisibleCart() === true) {
                $scope.$apply(ctrl.checkFixed);
            }
        };

        ctrl.startTimerClose = function () {
            timer = $timeout(() => {
                ctrl.cartClose();
            }, cartConfig.cartMini.delayHide);
        };

        ctrl.clearTimerClose = function () {
            if (timer != null) {
                $timeout.cancel(timer);
            }
        };

        ctrl.checkFixed = function () {
            ctrl.isCartMiniFixed = $window.pageYOffset > ctrl.staticPosition.top;
        };

        ctrl.clickOut = function (event) {
            const parentCart = domService.closest(event.target, '[data-cart-mini]');

            if (parentCart == null && ctrl.checkVisibleCart() === true) {
                $scope.$apply(() => {
                    ctrl.cartClose();
                });
            }
        };
    };

    angular.module('cart').controller('CartMiniPopupCtrl', CartMiniPopupCtrl);


})(angular);
