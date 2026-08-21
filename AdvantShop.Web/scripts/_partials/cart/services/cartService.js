/*@ngInject*/
/** @type{CartServiceFnType}
 *  @this{CartServiceType}
 * */
const cartService = function ($document, $q, $http, $translate, $window, cartConfig, domService, SweetAlert, customOptionsService) {
    const service = this;
    /**
     *  @type{ICart}
     * */
    const cart = {};
    let isRequestProcess = false,
        isInitilaze = false,
        needInfoShow = false;
    const deferes = [],
        callbacks = {},
        cartMiniCallbacks = new Map();

    service.getData = function (cache, queryParams) {
        const defer = $q.defer();
        let _cache = cache;
        if (_cache == null) {
            _cache = true;
        }

        if (isInitilaze === true && _cache === true) {
            defer.resolve(cart);
        } else if (isRequestProcess === true) {
            deferes.push(defer);
        } else {
            isRequestProcess = true;

            deferes.push(defer);

            $http.post('/cart/getCart', angular.extend({ rnd: Math.random() }, queryParams || {})).then((response) => {
                angular.extend(cart, response.data);
                isInitilaze = true;
                isRequestProcess = false;

                for (let i = deferes.length - 1; i >= 0; i--) {
                    deferes[i].resolve(cart);
                }

                deferes.length = 0;
            });
        }

        return defer.promise.then((result) => {
            service.processCallback('get', result);
            return result;
        });
    };

    service.updateAmount = function (items, queryParams) {
        return $http
            .post(
                '/cart/updateCart',
                angular.extend(
                    {
                        items,
                        rnd: Math.random(),
                    },
                    queryParams || {},
                ),
            )
            .then((response) => {
                service.processCallback('update', response.data);
                return service.getData(false, queryParams);
            });
    };

    service.removeItem = function (shoppingCartItemId, queryParams) {
        return $http
            .post('/cart/removeFromCart', angular.extend({ itemId: shoppingCartItemId }, queryParams || {}))
            .then((response) => service.getData(false, queryParams).then(() => response.data))
            .then((data) => {
                service.processCallback('remove', data);
                return data;
            });
    };

    service.addItem = function ({
        offerId,
        productId,
        amount,
        attributesXml,
        payment,
        mode,
        lpId,
        lpUpId,
        lpEntityId,
        lpEntityType,
        lpBlockId,
        lpButtonName,
        lpPriceValue,
        hideShipping,
        offerIds,
        modeFrom,
        forceHiddenPopup,
        queryParams,
        cartAddType,
    }) {
        const params = angular.extend(
            {
                offerId,
                productId,
                amount,
                attributesXml,
                payment,
                mode,
                lpId,
                lpUpId,
                lpEntityId,
                lpEntityType,
                lpBlockId,
                lpButtonName,
                lpPriceValue,
                hideShipping,
                offerIds,
                modeFrom,
            },
            queryParams || {},
        );

        if (params.offerId == null && params.offerIds == null) $q.reject('cartService.addItem: offerId or offerIds is required');

        return $http.post('/cart/addToCart', params).then((response) => {
            const result = response.data;

            if (response.data.status !== 'redirect') {
                return service.getData(false, params).then((data) => {
                    service.processCallback('add', [result, forceHiddenPopup, cartAddType]);
                    return [result, data];
                });
            }
            const defer = $q.defer();
            const promise = defer.promise;
            defer.resolve([result]);
            return promise;
        });
    };

    service.addItems = function (items, queryParams) {
        if (items == null || items.length === 0) return $q.reject('cartService: parameter "items" is required');

        return $http.post('/cart/addCartItems', angular.extend({ items }, queryParams || {})).then((response) => {
            const result = response.data;
            result.addedCount = items.length;
            if (result.status === 'success') {
                return service.getData(false, queryParams).then(() => {
                    service.processCallback('add', result);
                    return [result];
                });
            }
            throw new Error('cartService: error while adding items');
        });
    };

    service.clear = function (queryParams) {
        return $http.post('/Cart/ClearCart', queryParams || {}).then(() => {
            service.processCallback('clear');
            return service.getData(false, queryParams);
        });
    };

    service.addCallback = function (name, func, targetName) {
        callbacks[name] ||= [];

        if (func == null) {
            throw Error('Callback for cart equal null');
        }

        callbacks[name].push({ callback: func, targetName: targetName || null });
    };

    service.processCallback = function (name, params, targetName) {
        if (callbacks[name] == null) {
            return;
        }

        for (let i = callbacks[name].length - 1; i >= 0; i--) {
            if (targetName != null && callbacks[name][i].targetName === targetName) {
                callbacks[name][i].callback(cart, params);
            } else {
                callbacks[name][i].callback(cart, params);
            }
        }
    };

    service.removeCallback = function (name, targetName, cb) {
        const arrayCallbacksByName = callbacks[name];
        let index;

        if (arrayCallbacksByName == null) {
            return;
        }

        if (targetName != null) {
            for (let i = 0; i < arrayCallbacksByName.length; i++) {
                if (arrayCallbacksByName[i].targetName === targetName && (cb == null || cb === arrayCallbacksByName[i].callback)) {
                    arrayCallbacksByName.splice(i, 1);
                    i--;
                }
            }
        } else {
            index = callbacks.indexOf(callbacks[name]);

            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    };

    service.setStateInfo = function (needShow) {
        needInfoShow = needShow;
    };

    let timerShowSuccess;
    service.showInfoWithDebounce = function (data) {
        if (needInfoShow === true) {
            if (timerShowSuccess != null) {
                clearTimeout(timerShowSuccess);
            }

            timerShowSuccess = setTimeout(() => {
                service.showInfo(data);
            }, 700);
        }
    };

    service.showInfo = function () {
        $document[0].addEventListener('click', clickout);

        const html =
            `В корзине ${cart.Count} на сумму ${cart.TotalPrice}<div class="flex center-xs m-t-xs m-b-xs">` +
            `<div class="col-xs-6"><a class="btn btn-small btn-expander btn-action " href="./cart">${$translate.instant('Js.Cart.Cart')}</a></div>${
                cart.ShowConfirmButtons
                    ? `<div class="col-xs-6"><a class="btn btn-small btn-expander btn-confirm" href="./${
                          cart.MobileIsFullCheckout ? 'checkout' : 'checkoutmobile'
                      }">${$translate.instant('Js.Cart.Checkout')}</a></div>`
                    : ''
            }</div>`;

        SweetAlert.info(null, {
            title: null,
            html,
            position: 'top',
            grow: 'row',
            icon: null,
            padding: '8px 0',
            customClass: {
                container: 'mobile-cart-popover-container',
                popup: 'mobile-cart-popover cs-br-1',
            },
            buttonsStyling: false,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            timer: 5000,
            toast: true,
        })
            .then((result) => {
                $document[0].removeEventListener('click', clickout);

                if (result.value === true) {
                    $window.location.assign('./cart');
                }
            })
            .catch((error) => {
                throw new Error(error);
            });
    };

    function clickout(event) {
        if (domService.closest(event.target, '.swal2-popup') == null) {
            Sweetalert2.close();
        }
    }

    service.findInCart = function (productId, offerId, customOptions) {
        if (!cart.CartProducts) {
            return undefined;
        }
        let products = cart.CartProducts.filter((x) => x.ProductId === productId);

        if (offerId === null && customOptions === null && products.length === 1) return products[0];

        if (offerId) {
            products = products.filter((x) => x.OfferId === offerId);
        }

        if (customOptions) {
            products = products.filter(
                (product) =>
                    (product.SelectedOptions ?? []).length === customOptions.length &&
                    customOptionsService.isEqualCustomOptions(
                        product.SelectedOptions ?? [],
                        customOptionsService.customOptionItemToEvaluatedCustomOptionsMapper(customOptions),
                    ),
            );
        }
        return products[0];
    };

    service.subscribeCartMini = (cartMiniOpen, key, actions = [cartConfig.callbackNames.open, cartConfig.callbackNames.add]) => {
        const targetName = 'cartMiniList';

        const cartMiniTypeFn = (...data) => {
            const [_, info] = data;
            if (Array.isArray(info)) {
                const cartAddType = info[2];
                if (cartAddType === cartConfig.cartAddType.WithSpinbox) return;
            }
            cartMiniOpen();
        };

        const unsubscribe = () => {
            actions.forEach((action) => {
                service.removeCallback(action, targetName, cartMiniTypeFn);
            });
            cartMiniCallbacks.delete(key);
        };

        if (cartMiniCallbacks.has(key)) return unsubscribe;

        cartMiniCallbacks.set(key, cartMiniTypeFn);

        actions.forEach((action) => {
            service.addCallback(action, cartMiniTypeFn, targetName);
        });

        return unsubscribe;
    };
};

angular.module('cart').service('cartService', cartService);
