import cartMobileFullTemplate from '../templates/cart-mobile-full.html';
import cartFullTemplate from '../templates/cart-full.html';
import cartFullModernTemplate from '../templates/new-cart-full.html';
import cartFullItemsTemplate from '../templates/cart-full-items.html';
import cartFullSummaryTemplate from '../templates/cart-full-summary.html';

type CartFullViewType = 'modern' | 'default';

(function () {
    function insertTrancludeElement(tpl: any, transclude, scope) {
        const element = document.createElement('div');
        element.innerHTML = tpl;
        const sidebarElTransclude = angular.element(element).find('.js-cart-mini-transclude');

        transclude(
            scope,
            (cloneEl) => {
                sidebarElTransclude.append(cloneEl);
            },
            null,
        );
        return element;
    }

    angular.module('cart').directive('cartMini', () => ({
        restrict: 'A',
        scope: true,
        controller: 'CartMiniCtrl',
        controllerAs: 'cartMini',
        bindToController: true,
    }));

    angular.module('cart').directive(
        'cartMiniSidebar',
        /* @ngInject */ ($templateRequest, cartMiniTemplatesConfig, cartService, sidebarsContainerService, $translate) => ({
            restrict: 'A',
            scope: true,
            transclude: true,
            link(scope, _element, _attrs, _ctrls, transclude) {
                $templateRequest(cartMiniTemplatesConfig.cartMiniSidebarTemplate).then((tpl) => {
                    const tempEl = insertTrancludeElement(tpl, transclude, scope);

                    cartService.subscribeCartMini(() => {
                        sidebarsContainerService.open({
                            contentId: `cart-mini`,
                            template: tempEl.innerHTML,
                            title: $translate.instant('Js.Cart.Cart'),
                            hideFooter: true,
                            sidebarClass: `sidebar--cart`,
                            scope,
                        });
                    }, 'cartMiniSidebar');
                });
            },
        }),
    );
    angular.module('cart').directive(
        'cartMiniPopup',
        /* @ngInject */ ($templateRequest, $compile, cartMiniTemplatesConfig) => ({
            require: ['cartMiniPopup', '^cartMini'],
            restrict: 'A',
            scope: true,
            controller: 'CartMiniPopupCtrl',
            controllerAs: 'cartMiniPopup',
            bindToController: true,
            transclude: true,
            link(scope, element, _attrs, ctrls, transclude) {
                $templateRequest(cartMiniTemplatesConfig.cartMiniPopupTemplate).then((tpl) => {
                    const tempEl = insertTrancludeElement(tpl, transclude, scope);

                    $compile(element.html(tempEl).contents())(scope);

                    if (ctrls) {
                        const cartMiniPopup = ctrls[0];

                        cartMiniPopup.initialized = true;

                        if (cartMiniPopup.isMobile !== true) {
                            element[0].addEventListener('mouseenter', () => {
                                cartMiniPopup.clearTimerClose();
                                scope.$digest();
                            });

                            element[0].addEventListener('mouseleave', () => {
                                cartMiniPopup.startTimerClose();
                                scope.$digest();
                            });
                        }
                    }
                });
            },
        }),
    );
    angular.module('cart').directive('cartMiniTrigger', () => ({
        require: '^cartMini',
        restrict: 'A',
        link(scope, element, _attrs, ctrl) {
            element.on('click', (event) => {
                ctrl?.triggerClick(event);
                scope.$apply();
            });
        },
    }));

    angular.module('cart').directive(
        'cartMiniList',
        /* @ngInject */ ($templateRequest, $compile, cartMiniTemplatesConfig) => ({
            restrict: 'EA',
            scope: {
                cartData: '=',
                isMobile: '<?',
                isShowRemove: '<?',
                linkAsQuickview: '<?',
            },
            replace: true,
            controller: 'CartMiniListCtrl',
            controllerAs: 'cartMiniList',
            bindToController: true,
            link(scope, element, _attrs, _ctrls) {
                $templateRequest(cartMiniTemplatesConfig.cartMiniListTemplate).then((tpl) => {
                    $compile(element.html(tpl).contents())(scope);
                });
            },
        }),
    );

    angular.module('cart').directive('cartFull', () => ({
        restrict: 'EA',
        scope: {
            photoWidth: '@',
            showOnlyItems: '<?',
            showBriefDescription: '<?',
            showPhoto: '<?',
            isShowPhotoInCart: '@',
            isCheckout: '@',
            linkAsQuickview: '<?',
            typeView: '@',
            onInit: '&',
        },
        controller: 'CartFullCtrl',
        controllerAs: 'cartFull',
        bindToController: true,
        replace: true,
        templateUrl: (_el, attrs) => {
            if ((attrs.typeView as CartFullViewType | undefined) === 'modern') {
                return cartFullModernTemplate;
            }
            return cartFullTemplate;
        },
    }));

    angular.module('cart').directive('cartFullItems', () => ({
        restrict: 'EA',
        scope: {
            showBriefDescription: '<?',
            showPhoto: '<?',
            isCheckout: '@',
            linkAsQuickview: '<?',
            cartData: '<',
            onUpdateAmount: '&',
            onRemove: '&',
        },
        controller: 'CartFullItemsCtrl',
        controllerAs: 'cartFullItems',
        bindToController: true,
        replace: true,
        templateUrl: cartFullItemsTemplate,
    }));

    angular.module('cart').directive('cartFullSummary', () => ({
        restrict: 'EA',
        scope: {
            showOnlyItems: '<?',
            cartData: '<',
            onRefresh: '&',
        },
        controller: 'CartFullSummaryCtrl',
        controllerAs: 'cartFullSummary',
        bindToController: true,
        replace: true,
        templateUrl: cartFullSummaryTemplate,
    }));

    angular.module('cart').directive('cartMobileFull', () => ({
        restrict: 'EA',
        scope: {
            showOnlyItems: '<?',
            showPhoto: '<?',
            isShowPhotoInCart: '@',
            hasBottomPanel: '@',
            isCheckout: '@',
            showBriefDescription: '<?',
            linkAsQuickview: '<?',
            onInit: '&',
        },
        controller: 'CartMobileFullCtrl',
        controllerAs: 'cartMFull',
        bindToController: true,
        replace: true,
        templateUrl: cartMobileFullTemplate,
    }));

    angular.module('cart').directive('cartAdd', () => ({
        restrict: 'EA',
        scope: true,
        controller: 'CartAddCtrl',
        controllerAs: 'cartAdd',
    }));

    angular.module('cart').directive(
        'cartCount',
        /* @ngInject */ ($sce) => ({
            restrict: 'A',
            scope: true,
            controller: 'CartCountCtrl',
            controllerAs: 'cartCount',
            bindToController: true,
            link(_scope, element, attrs, ctrl) {
                if (ctrl) {
                    const startValue = element.html();
                    ctrl.type = attrs.type;
                    ctrl.startValue = $sce.trustAsHtml(startValue);
                }
            },
        }),
    );

    angular.module('cart').directive('cartConfirm', () => ({
        restrict: 'A',
        scope: true,
        controller: 'CartConfirmCtrl',
        controllerAs: 'cartConfirm',
        bindToController: true,
    }));

    angular.module('cart').directive('clearCart', () => ({
        restrict: 'EA',
        controller: 'CartFullCtrl',
        controllerAs: 'cartFull',
        bindToController: true,
    }));

    angular.module('cart').directive(
        'cartMiniFooter',
        /* @ngInject */ ($timeout, $window, cartService, cartConfig, $templateRequest, cartMiniTemplatesConfig, $compile) => ({
            restrict: `A`,
            scope: true,
            controller: 'CartMiniCtrl',
            controllerAs: '$ctrl',
            bindToController: true,
            link: {
                pre(scope, element) {
                    $templateRequest(cartMiniTemplatesConfig.cartMiniFooterTemplate).then((tpl) => {
                        $compile(element.html(tpl).contents())(scope);
                    });
                },
                post(scope, element) {
                    const calcHeightFooter = () => {
                        $timeout(() => {
                            const style = $window.getComputedStyle(element[0]),
                                height = element[0].offsetHeight,
                                margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom),
                                padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom),
                                border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
                            const totalHeight = `${height + margin - padding + border || 0}px`;

                            const root = document.querySelector<HTMLElement>(':root');
                            if (!root) throw Error(':root not found ');
                            root.style.setProperty('--cartFooterHeight', totalHeight);
                        }, 0);
                    };

                    calcHeightFooter();
                    cartService.addCallback(cartConfig.callbackNames.update, calcHeightFooter, `cartMiniFooter`);

                    scope.$on('$destroy', () => {
                        cartService.removeCallback(cartConfig.callbackNames.update, `cartMiniFooter`);
                    });
                },
            },
        }),
    );
})();
