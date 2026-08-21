/*@ngInject*/
function HeaderCtrl(sidebarsContainerService) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.searchHeaderActive = false;
    };

    ctrl.toggleMenu = function () {
        sidebarsContainerService.toggle({ contentId: 'sidebarMenu', isStatic: true });
    };

    ctrl.searchHide = function () {
        ctrl.searchHeaderActive = false;
    };

    ctrl.searchShow = function () {
        ctrl.searchHeaderActive = true;
        sidebarsContainerService.close({ contentId: 'sidebarMenu', isStatic: true });
    };

    ctrl.toggleCart = function ($event, cartOptions) {
        if (typeof $event !== 'undefined') {
            $event.preventDefault();
        }

        sidebarsContainerService.toggle({
            contentId: 'sidebarCart',
            title: 'Корзина',
            template: `<div data-cart-mini=""><div class="cart-mini-list-mobile" data-is-show-remove="true" data-cart-mini-list data-is-mobile="true" data-cart-data="cartMini.cartData" data-link-as-quickview="${cartOptions?.linkAsQuickview || 'false'}"></div></div>`,
            hideFooter: true,
        });
    };

    ctrl.togglePhonesList = (templateUrl) => {
        sidebarsContainerService.toggle({
            contentId: 'phonesList',
            templateUrl,
            hideFooter: true,
            hideHeader: true,
        });
    };

    ctrl.searchFocus = function () {
        sidebarsContainerService.close({ contentId: 'sidebarMenu', isStatic: true });
    };
}

export default HeaderCtrl;
