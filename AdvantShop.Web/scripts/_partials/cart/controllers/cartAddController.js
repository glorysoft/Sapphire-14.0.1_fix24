import { PubSub } from '../../../_common/PubSub/PubSub.js';
import { isEmpty } from '../../../_common/utils/define';

let cartToolbar, timerPopoverHide;
/*@ngInject*/
/** @type{CartAddControllerFnType}
 *  @this{CartAddController}
 * */
const CartAddCtrl = function (
    $scope,
    $attrs,
    $parse,
    $q,
    $timeout,
    $window,
    cartConfig,
    cartService,
    moduleService,
    popoverService,
    $translate,
    toaster,
    customOptionsService,
) {
    const ctrl = this;
    ctrl.parseAttributes = function () {
        ctrl.data = {
            cartAddValid: $attrs.cartAddValid ? $parse($attrs.cartAddValid) : null,
            maxStepSpinbox: $parse($attrs.maxStepSpinbox)($scope),
            minStepSpinbox: $parse($attrs.minStepSpinbox)($scope),
            stepSpinbox: $parse($attrs.stepSpinbox)($scope) ?? 1,
            href: $attrs.href,
            mode: $attrs.mode,
            lpId: $attrs.lpId,
            lpUpId: $attrs.lpUpId,
            lpEntityId: $attrs.lpEntityId,
            lpEntityType: $attrs.lpEntityType,
            lpBlockId: $attrs.lpBlockId,
            lpButtonName: $attrs.lpButtonName,
            hideShipping: $attrs.hideShipping,
            source: $attrs.source,
            modeFrom: $attrs.modeFrom,
            offerId: $attrs.offerId ? $parse($attrs.offerId)($scope) : null,
            productId: $attrs.productId ? $parse($attrs.productId)($scope) : null,
            amount: $attrs.amount ? $parse($attrs.amount)($scope) : null,
            attributesXml: $attrs.attributesXml ? $parse($attrs.attributesXml)($scope) : null,
            payment: $attrs.payment ? $parse($attrs.payment)($scope) : null,
            forceHiddenPopup: $parse($attrs.forceHiddenPopup)($scope),
            offerIds: $attrs.offerIds ? $parse($attrs.offerIds)($scope) : [],
            cartAddType: $parse($attrs.cartAddType)($scope),
            lpPriceValue: $attrs.lpPriceValue ? $parse($attrs.lpPriceValue)($scope) : null,
        };

        $scope.$watch($attrs.cartAddType, (newVal, oldVal) => {
            if (newVal === oldVal) return;
            ctrl.data.cartAddType = newVal;
            ctrl.refresh();
        });

        $scope.$watch($attrs.offerId, (newVal, oldVal) => {
            if (newVal === oldVal) return;
            ctrl.data.offerId = newVal;
            ctrl.refresh();
        });

        $scope.$watch($attrs.productId, (newVal, oldVal) => {
            if (newVal === oldVal) return;

            ctrl.data.productId = newVal;
            ctrl.refresh();
        });

        $scope.$watch($attrs.amount, (newVal, oldVal) => {
            if (newVal === oldVal) return;

            ctrl.data.amount = newVal;
            ctrl.refresh();
        });

        $scope.$watch($attrs.attributesXml, (newVal, oldVal) => {
            if (newVal === oldVal) return;

            ctrl.data.attributesXml = newVal;
        });

        $scope.$watch($attrs.payment, (newVal, oldVal) => {
            if (newVal === oldVal) return;

            ctrl.data.payment = newVal;
            ctrl.refresh();
        });

        $scope.$watchCollection($attrs.offerIds, (newVal, oldVal) => {
            if (newVal === oldVal) return;

            ctrl.data.offerIds = newVal;
            ctrl.refresh();
        });

        $attrs.$observe('href', (newVal, oldVal) => {
            if (newVal === oldVal) return;

            ctrl.data.href = newVal;
        });

        $scope.$watch($attrs.lpPriceValue, (newVal, oldVal) => {
            if (newVal === oldVal) return;

            ctrl.data.lpPriceValue = newVal;
        });
    };

    ctrl.checkSizeAndColor = function (_sizeOrColor, _type, additionalData) {
        if (!additionalData.offer || additionalData.offer.ProductId !== ctrl.data.productId) return;
        ctrl.productCartData = cartService.findInCart(ctrl.data.productId, additionalData.offer.OfferId, ctrl.productSelectedOptions);
    };

    ctrl.$onInit = function () {
        ctrl.parseAttributes();

        if (ctrl.data.source && ctrl.data.source === 'mobile') {
            cartService.setStateInfo(true);
        }

        ctrl.needAdd = true;
        ctrl.isLoading = false;
        ctrl.refresh();

        PubSub.subscribe('cart.updateAmount', () => ctrl.refresh());
        PubSub.subscribe('cart.remove', (offerId) => {
            if (offerId === ctrl.data.offerId || ctrl.data.offerId === 0) {
                ctrl.refresh();
            }
        });

        PubSub.subscribe('cart.clear', () => ctrl.refresh());
        PubSub.subscribe('product.customOptions.change', ({ productId, offerId, items }) => {
            if (offerId && ctrl.data.offerId !== offerId) return;
            if (productId !== ctrl.data.productId) return;
            ctrl.productSelectedOptions = customOptionsService.getSelectedOptions(items);
            ctrl.productCartData = cartService.findInCart(ctrl.data.productId, ctrl.data.offerId, ctrl.productSelectedOptions);
            ctrl.needAdd = isEmpty(ctrl.productCartData);
            ctrl.updateStateButton();
        });
    };

    ctrl.addItem = (event) => {
        event.preventDefault();

        const isValid = !ctrl.data.cartAddValid || ctrl.data.cartAddValid($scope);

        if (isValid === false) {
            return;
        }

        if (ctrl.state === cartConfig.cartStateButton.loading) {
            // eslint-disable-next-line consistent-return
            return $q.resolve(null);
        }

        ctrl.isLoadingAdd = true;

        ctrl.updateStateButton();

        // eslint-disable-next-line consistent-return
        return cartService
            .addItem(ctrl.data)
            .then((resultAdd) => {
                const [{ status }] = resultAdd;
                if (status === 'redirect') {
                    if (resultAdd[0].url && resultAdd[0].url.length > 0) {
                        $window.location.assign(resultAdd[0].url);
                    } else {
                        $window.location.assign(ctrl.data.href);
                    }
                } else if (status === 'fail') {
                    toaster.pop('error', '', $translate.instant('Js.CartAdd.Fail'));
                } else {
                    PubSub.publish('add_to_cart', ctrl.data.href);
                    PubSub.publish(
                        'cart.add',
                        ctrl.data.offerId,
                        ctrl.data.productId,
                        ctrl.data.amount,
                        ctrl.data.attributesXml,
                        resultAdd['0'].cartId,
                        event.target,
                    );
                    PubSub.publish('cart.addv2', ctrl.data.productId, resultAdd['0'].cartId, resultAdd['0'].CartItem, event.target);
                    moduleService.update(['minicartmessage', 'fullcartmessage']).then(ctrl.popoverModule);
                }
                ctrl.refresh(true);
                return resultAdd;
            })
            .then((result) => {
                if (result[0].status !== 'redirect') {
                    ctrl.showInfo(result);
                }

                return result;
            })
            .finally((result) => {
                ctrl.isLoadingAdd = false;
                ctrl.isLoading = false;
                ctrl.updateStateButton();
                return result;
            });
    };
    ctrl.showInfo = function () {
        if (ctrl.data.source === 'mobile' && ctrl.data.cartAddType !== cartConfig.cartAddType.WithSpinbox) {
            cartService.showInfoWithDebounce();
        }
    };
    ctrl.isLoadingAll = function () {
        ctrl.isLoadingAllTotal = Boolean(ctrl.isLoading) || Boolean(ctrl.isLoadingAdd);
        return ctrl.isLoadingAllTotal;
    };

    ctrl.isEmptyProductCart = function () {
        return !ctrl.productCartData || ctrl.productCartData.Amount < ctrl.productCartData.MinAmount;
    };

    ctrl.getStateButton = function () {
        let result = null;
        if (ctrl.isLoadingAll()) {
            result = cartConfig.cartStateButton.loading;
        } else if (!ctrl.isEmptyProductCart() && ctrl.data.cartAddType === cartConfig.cartAddType.WithSpinbox) {
            result = cartConfig.cartStateButton.update;
        } else if (
            ctrl.needAdd ||
            !ctrl.data.cartAddType ||
            ctrl.data.cartAddType === '' ||
            ctrl.data.cartAddType === cartConfig.cartAddType.Classic ||
            ctrl.data.cartAddType === cartConfig.cartAddType.SeparateWithSpinbox
        ) {
            result = cartConfig.cartStateButton.add;
        }
        return result;
    };
    ctrl.updateStateButton = function () {
        ctrl.state = ctrl.getStateButton() ?? ctrl.state;
    };
    ctrl.updateAmount = function (value, itemId) {
        if (ctrl.state === cartConfig.cartStateButton.loading) {
            return $q.resolve(null);
        }

        const item = {
            Key: itemId,
            Value: value,
        };
        ctrl.isLoading = true;

        if (ctrl.isEmptyProductCart()) {
            ctrl.updateStateButton();

            const removedProductOfferId = ctrl.productCartData.OfferId;
            return cartService
                .removeItem(ctrl.productCartData.ShoppingCartItemId)
                .then(() => {
                    moduleService.update('fullcartmessage');
                    return ctrl.refresh();
                })
                .then(() => {
                    PubSub.publish('cart.remove', removedProductOfferId);
                })
                .finally(() => {
                    ctrl.needAdd = true;
                    ctrl.isLoading = false;
                    ctrl.updateStateButton();
                });
        }
        return cartService
            .updateAmount([item])
            .then(() => {
                moduleService.update('minicartmessage');
                return ctrl.refresh();
            })
            .then(() => {
                PubSub.publish('cart.updateAmount');
            })
            .finally(() => {
                ctrl.isLoading = false;
                ctrl.updateStateButton();
            });
    };

    ctrl.refresh = function (cache) {
        return cartService.getData(cache).then((data) => {
            ctrl.cartData = data;
            if (ctrl.cartData.CartProducts.length === 0) {
                ctrl.productCartData = null;
                ctrl.needAdd = true;
                ctrl.updateStateButton();

                return null;
            }

            const item = cartService.findInCart(ctrl.data.productId, ctrl.data.offerId === 0 ? null : ctrl.data.offerId, ctrl.productSelectedOptions);
            if (item) {
                ctrl.productCartData = item;
                ctrl.needAdd = false;
            } else {
                ctrl.productCartData = null;
                ctrl.needAdd = true;
            }
            ctrl.updateStateButton();
            return data;
        });
    };
    ctrl.popoverModule = function (content) {
        if (moduleService.getModule('minicartmessage') && content[0].trim().length > 0) {
            $timeout(() => {
                popoverService.getPopoverScope('popoverCartToolbar').then((popoverScope) => {
                    cartToolbar ||= document.getElementById('cartToolbar');

                    popoverScope.active(cartToolbar);

                    popoverScope.updatePosition(cartToolbar);

                    if (timerPopoverHide) {
                        $timeout.cancel(timerPopoverHide);
                    }

                    timerPopoverHide = $timeout(() => {
                        popoverScope.deactive();
                    }, 5000);
                });
            }, 0);
        }
    };
};

angular.module('cart').controller('CartAddCtrl', CartAddCtrl);
