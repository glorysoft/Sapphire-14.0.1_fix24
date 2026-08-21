import { vi, describe, beforeEach, it, expect } from 'vitest';

import '../../../../vendors/sweetalert/sweetalert2.default.js';
import '../../../../vendors/ng-sweet-alert/ng-sweet-alert.js';
import '../../../_common/dom/dom.module.js';
import '../../../_common/module/module.module.js';
import '../../../_common/popover/popover.module.js';
import '../../../_common/urlHelper/urlHelperService.module.js';
import '../cart.module.js';
import '../../../../node_modules/angular-translate/dist/angular-translate.js';
import '../../../_common/PubSub/__mocks__/PubSub.js';
import {
    cartData,
    addItemServiceResultSucess,
    cartAddAttrsAll,
    cartAddNeedParams,
    addToCartResultSucess,
    addToCartResultRedirect,
    updateCartParams,
    cartDataWithCustomOptions,
    evaluatedCustomOptionsToCustomOptionItemMapper,
} from '../__mocks__/cart.js';
import { createTestApp } from '../../../../tests/mocks/angularjs-mocks.ts';
import sidebarContainerModule from '../../../../Areas/Mobile/scripts/_common/sidebarsContainer/sidebarsContainer.module.js';

describe('CartService', () => {
    let cartService, cartConfig, $timeout, $httpBackend, $injector;

    const rnd = 0.123456789;

    document.head.innerHTML = `<base href="http://example.net/" />`;

    const getTestApp = () => createTestApp(['ng-sweet-alert', 'pascalprecht.translate', 'dom', 'urlHelper', 'cart', sidebarContainerModule]);

    beforeEach(() => {
        vi.spyOn(global.Math, 'random').mockReturnValue(rnd);

        const app = getTestApp();

        $injector = app.$injector;

        cartConfig = $injector.get('cartConfig');
        cartService = $injector.get('cartService');
        $timeout = $injector.get('$timeout');
        $httpBackend = $injector.get('$httpBackend');
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('getData', () => {
        let fn1;

        beforeEach(() => {
            fn1 = vi.fn();
            cartService.addCallback(cartConfig.callbackNames.get, fn1);
        });

        it('should correctly call getCart', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd, param1: 'test' }).respond(200, cartData);
            let result = null;

            cartService.getData(null, { param1: 'test' }).then((response) => {
                result = response;
            });

            $httpBackend.flush();

            expect(result).toEqual(cartData);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should correctly call callback after get cart', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd, param1: 'test' }).respond(200, cartData);

            cartService.getData(null, { param1: 'test' });

            $httpBackend.flush();

            expect(fn1).toHaveBeenCalledWith(cartData, cartData);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should correctly return the cart when called from multiple locations', () => {
            let callCount = 0;
            $httpBackend.expectPOST('/cart/getCart', { rnd, param1: 'test' }).respond(() => {
                ++callCount;
                return [200, cartData];
            });

            let result1 = null;
            let result2 = null;
            let result3 = null;

            cartService.getData(null, { param1: 'test' }).then((response) => {
                result1 = response;
            });
            cartService.getData(null, { param1: 'test' }).then((response) => {
                result2 = response;
            });
            cartService.getData(null, { param1: 'test' }).then((response) => {
                result3 = response;
            });

            $httpBackend.flush();
            expect(result1).toEqual(cartData);
            expect(result2).toEqual(cartData);
            expect(result3).toEqual(cartData);
            expect(callCount).toEqual(1);
            expect(fn1).toHaveBeenCalledWith(cartData, cartData);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should correctly get cart data from cache, when cache is true and cart service is initialize', () => {
            let callCount = 0;
            $httpBackend.expectPOST('/cart/getCart', { rnd, param1: 'test' }).respond(() => {
                ++callCount;
                return [200, cartData];
            });

            let result1 = null;
            let result2 = null;

            cartService.getData(null, { param1: 'test' }).then((response) => {
                result1 = response;
            });
            $httpBackend.flush();
            expect(result1).toEqual(cartData);
            expect(callCount).toEqual(1);
            expect(fn1).toHaveBeenCalledTimes(1);

            $httpBackend.resetExpectations();

            cartService.getData(null, { param1: 'test' }).then((response) => {
                result2 = response;
            });

            try {
                $timeout.flush();
                $rootScope.$digest();
            } catch (_e) {
                process.stderr.write('catch flush error\r\n');
            }

            expect(result2).toEqual(cartData);
            expect(callCount).toEqual(1);
            expect(fn1).toHaveBeenCalledTimes(2);
            expect(fn1).toHaveBeenCalledWith(cartData, cartData);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    describe('updateAmount', () => {
        let fn1;

        beforeEach(() => {
            fn1 = vi.fn();
            cartService.addCallback(cartConfig.callbackNames.update, fn1);
        });

        it('should correctly call updateCart', () => {
            const addToCartResponse = { data: addToCartResultSucess };
            const request = updateCartParams;

            $httpBackend.expectPOST('/cart/updateCart', { items: request, rnd }).respond(200, addToCartResponse);
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);
            let result = null;

            cartService.updateAmount(request).then((response) => {
                result = response;
            });

            $httpBackend.flush();

            expect(result).toEqual(cartData);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should correctly call callback after update', () => {
            const addToCartResponse = { data: addToCartResultSucess };
            const request = updateCartParams;

            $httpBackend.expectPOST('/cart/updateCart', { items: request, rnd }).respond(200, addToCartResponse);
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);

            cartService.updateAmount(request);

            $httpBackend.flush();

            expect(fn1).toHaveBeenCalledWith(cartData, addToCartResponse);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
    describe('removeItem', () => {
        let fn1;

        beforeEach(() => {
            fn1 = vi.fn();
            cartService.addCallback(cartConfig.callbackNames.remove, fn1);
        });

        it('should correctly call removeFromCart', () => {
            const removeFromCartResponse = { data: addToCartResultSucess };
            const request = 1;

            $httpBackend.expectPOST('/cart/removeFromCart', { itemId: 1 }).respond(200, removeFromCartResponse);
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);
            let result = null;

            cartService.removeItem(request).then((response) => {
                result = response;
            });

            $httpBackend.flush();

            expect(result).toEqual(removeFromCartResponse);
            expect(fn1).toHaveBeenCalledWith(cartData, removeFromCartResponse);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should correctly call callback after remove', () => {
            const removeFromCartResponse = { data: addToCartResultSucess };
            const request = 1;

            $httpBackend.expectPOST('/cart/removeFromCart', { itemId: 1 }).respond(200, removeFromCartResponse);
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);

            cartService.removeItem(request);

            $httpBackend.flush();

            expect(fn1).toHaveBeenCalledWith(cartData, removeFromCartResponse);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    describe('addItem', () => {
        let fn1;

        beforeEach(() => {
            fn1 = vi.fn();
            cartService.addCallback(cartConfig.callbackNames.add, fn1);
        });

        it('should correctly call addToCart, when response is successful', () => {
            const addToCartResponse = addToCartResultSucess;
            const request = cartAddAttrsAll;

            $httpBackend.expectPOST('/cart/addToCart', cartAddNeedParams).respond(200, addToCartResponse);
            $httpBackend.expectPOST('/cart/getCart', { rnd, ...cartAddNeedParams }).respond(200, cartData);
            let result = null;

            cartService.addItem(request).then((response) => {
                result = response;
            });

            $httpBackend.flush();

            expect(result).toEqual(addItemServiceResultSucess);
            expect(fn1).toHaveBeenCalledWith(cartData, [addToCartResponse, cartAddAttrsAll.forceHiddenPopup, cartAddAttrsAll.cartAddType]);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should correctly call callback after addItem', () => {
            const addToCartResponse = addToCartResultSucess;
            const request = cartAddAttrsAll;

            $httpBackend.expectPOST('/cart/addToCart', cartAddNeedParams).respond(200, addToCartResponse);
            $httpBackend.expectPOST('/cart/getCart', { rnd, ...cartAddNeedParams }).respond(200, cartData);

            cartService.addItem(request);
            $httpBackend.flush();

            expect(fn1).toHaveBeenCalledWith(cartData, [addToCartResponse, cartAddAttrsAll.forceHiddenPopup, cartAddAttrsAll.cartAddType]);

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should correctly call addToCart, when response is redirect', () => {
            const addToCartResponse = addToCartResultRedirect;
            const request = cartAddAttrsAll;

            $httpBackend.expectPOST('/cart/addToCart', cartAddNeedParams).respond(200, addToCartResponse);
            let result = null;

            cartService.addItem(request).then((response) => {
                result = response;
            });

            $httpBackend.flush();

            expect(result).toEqual([addToCartResponse]);
            expect(fn1).not.toHaveBeenCalled();

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should not call callback, when response is redirect', () => {
            const addToCartResponse = addToCartResultRedirect;
            const request = cartAddAttrsAll;

            $httpBackend.expectPOST('/cart/addToCart', cartAddNeedParams).respond(200, addToCartResponse);

            cartService.addItem(request);
            $httpBackend.flush();

            expect(fn1).not.toHaveBeenCalled();

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should not call addToCart when offerId and offerIds is null', () => {
            const addToCartResponse = addToCartResultRedirect;
            const request = { ...cartAddAttrsAll, offerId: null, offerIds: null };

            $httpBackend.expectPOST('/cart/addToCart').respond(200, addToCartResponse);

            cartService.addItem(request);

            try {
                $httpBackend.flush();
            } catch (_e) {
                process.stderr.write('catch flush error\r\n');
            }

            expect($httpBackend.verifyNoOutstandingExpectation).toThrow();
        });
    });
    describe('findInCart', () => {
        it('should return first founded by productId', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd, param1: 'test' }).respond(200, cartData);
            cartService.getData(null, { param1: 'test' });

            $httpBackend.flush();

            expect(cartService.findInCart(1753)).toEqual(cartData.CartProducts[0]);
        });

        it('should return first founded by productId and offerId', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd, param1: 'test' }).respond(200, cartDataWithCustomOptions);
            const targetOffer = 11111;
            const targetProduct = cartDataWithCustomOptions.CartProducts.find((x) => x.OfferId === targetOffer);

            cartService.getData(null, { param1: 'test' });

            $httpBackend.flush();

            expect(cartService.findInCart(targetProduct.ProductId, targetOffer)).toEqual(targetProduct);
        });

        it('should return first founded by productId and customOptions', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd, param1: 'test' }).respond(200, cartDataWithCustomOptions);
            const [targetProduct] = cartDataWithCustomOptions.CartProducts;

            cartService.getData(null, { param1: 'test' });

            $httpBackend.flush();

            expect(
                cartService.findInCart(targetProduct.ProductId, null, evaluatedCustomOptionsToCustomOptionItemMapper(targetProduct.SelectedOptions)),
            ).toEqual(targetProduct);
        });

        it('should not found product if has customOptions and in cart product without options', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd, param1: 'test' }).respond(200, cartDataWithCustomOptions);
            const [targetProduct] = cartData.CartProducts;

            cartService.getData(null, { param1: 'test' });
            $httpBackend.flush();

            expect(
                cartService.findInCart(
                    targetProduct.ProductId,
                    null,
                    evaluatedCustomOptionsToCustomOptionItemMapper(cartDataWithCustomOptions.CartProducts[0].SelectedOptions),
                ),
            ).toBeFalsy();
        });
    });

    describe('subscribeCartMini', () => {
        beforeEach(() => {
            cartService.removeCallback(cartConfig.callbackNames.add, 'cartMiniList')
            cartService.removeCallback(cartConfig.callbackNames.open, 'cartMiniList')
        })

        it('should always subscribe on add and open', () => {
            const callback = vi.fn();
            cartService.subscribeCartMini(callback, 'test');
            cartService.processCallback('add', [{}, false, cartConfig.cartAddType.Classic]);
            expect(callback).toHaveBeenCalled();
            callback.mockReset();
            cartService.processCallback('open');
            expect(callback).toHaveBeenCalled();
        });

        it('should stop calling the callback after unsubscribe is called', () => {
            const callback = vi.fn();
            const unsubscribe = cartService.subscribeCartMini(callback, 'test');
            cartService.processCallback('add', [{}, false, cartConfig.cartAddType.Classic]);
            expect(callback).toHaveBeenCalled();
            callback.mockReset();

            unsubscribe()

            cartService.processCallback('open');
            expect(callback).not.toHaveBeenCalled();
        });


        it('should completely isolate new subscriptions after the previous ones for the same key unsubscribed', () => {
            const callback1 = vi.fn();
            const key = 'test';


            const unsubscribe1 = cartService.subscribeCartMini(callback1, key);
            unsubscribe1();


            const callback2 = vi.fn();
            cartService.subscribeCartMini(callback2, key);


            cartService.processCallback('add', [{}, false, cartConfig.cartAddType.Classic]);


            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should unsubscribe self callback', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            const unsubscribe1 = cartService.subscribeCartMini(callback1, 'test');
            cartService.subscribeCartMini(callback2, 'test2');

            unsubscribe1()
            cartService.processCallback('add', [{}, false, cartConfig.cartAddType.Classic]);


            expect(callback2).toHaveBeenCalled();
        });

        it('should reuse existing active subscription callback for the same key', () => {
            const sharedCallback = vi.fn();
            const key = 'test';

            cartService.subscribeCartMini(sharedCallback, key);
            cartService.subscribeCartMini(sharedCallback, key);

            cartService.processCallback('add', [{}, false, cartConfig.cartAddType.Classic]);

            expect(sharedCallback).toHaveBeenCalledTimes(1);
        });

        describe('call callback when cartAddType is WithSpinbox', () => {
            it('should not call component on add', () => {
                const miniPopupFn = vi.fn();
                cartService.subscribeCartMini(miniPopupFn, 'test');
                cartService.processCallback('add', [{}, false, cartConfig.cartAddType.WithSpinbox]);
                expect(miniPopupFn).not.toHaveBeenCalled();
            });
            it('should call component on open', () => {
                const miniPopupFn = vi.fn();
                cartService.subscribeCartMini(miniPopupFn, 'test');
                cartService.processCallback('open');
            });
        });
    });
});
