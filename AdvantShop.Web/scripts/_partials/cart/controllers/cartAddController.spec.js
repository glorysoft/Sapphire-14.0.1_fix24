import { vi, describe, beforeEach, it, expect } from 'vitest';

import angular from 'angular';

import '../../../../vendors/sweetalert/sweetalert2.default.js';
import '../../../../vendors/ng-sweet-alert/ng-sweet-alert.js';
import 'angularjs-toaster';
import '../../../_common/dom/dom.module.js';
import '../../../_common/module/module.module.js';
import '../../../_common/popover/popover.module.js';
import '../../../_common/urlHelper/urlHelperService.module.js';
import sidebarContainerModule from '../../../../Areas/Mobile/scripts/_common/sidebarsContainer/sidebarsContainer.module.js';
import '../cart.module.js';
import '../../../../node_modules/angular-translate/dist/angular-translate.js';
import { PubSub } from '../../../_common/PubSub/PubSub.js';
import '../../../_common/PubSub/__mocks__/PubSub.js';
import {
    cartData,
    addItemServiceResultRedirect,
    addItemServiceResultSucess,
    cartAddAttrsAll,
    cartDataWithCustomOptions,
    evaluatedCustomOptionsToCustomOptionItemMapper,
} from '../__mocks__/cart.js';
import { cartAddConfigDefault } from '../cartConfigDefault.ts';

describe('CartAddCtrl', () => {
    let $controller,
        $rootScope,
        $document,
        $parse,
        $q,
        $timeout,
        $window,
        cartConfig,
        cartService,
        moduleService,
        popoverService,
        SweetAlert,
        $translate,
        domService,
        ctrl,
        $scope,
        $compile,
        customOptionsService,
        toaster,
        $httpBackend,
        $injector;

    const rnd = 0.123456789;
    vi.spyOn(global.Math, 'random').mockReturnValue(rnd);

    const targetElement = document.createElement('button');
    targetElement.textContent = 'Click me';
    document.body.appendChild(targetElement);

    const mouseEventClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
    });

    Object.defineProperty(mouseEventClick, 'target', { value: targetElement });

    document.head.innerHTML = `<base href="http://example.net/" />`;

    beforeEach(() => {
        $injector = angular.injector(
            ['ng', 'ngMock', 'popover', 'ng-sweet-alert', 'pascalprecht.translate', 'dom', 'module', 'toaster', 'urlHelper', 'cart', sidebarContainerModule],
            false,
        );

        $parse = $injector.get('$parse');
        $compile = $injector.get('$compile');
        $q = $injector.get('$q');
        $timeout = $injector.get('$timeout');
        $window = $injector.get('$window');
        cartConfig = $injector.get('cartConfig');
        cartService = $injector.get('cartService');
        customOptionsService = $injector.get('customOptionsService');
        moduleService = $injector.get('moduleService');
        popoverService = $injector.get('popoverService');
        SweetAlert = $injector.get('SweetAlert');
        domService = $injector.get('domService');
        $controller = $injector.get('$controller');
        $rootScope = $injector.get('$rootScope');
        $document = $injector.get('$document');
        toaster = $injector.get('toaster');
        $httpBackend = $injector.get('$httpBackend');
        $translate = $injector.get('$translate');

        $scope = $rootScope.$new();

        ctrl = $controller('CartAddCtrl', {
            $document,
            $scope,
            $attrs: {},
            $parse,
            $q,
            $timeout,
            $window,
            cartConfig,
            cartService,
            moduleService,
            popoverService,
            SweetAlert,
            $translate,
            domService,
            toaster,
        });
    });

    describe('$onInit', () => {
        it('should correct init ctrl', () => {
            ctrl.refresh = vi.fn();
            ctrl.parseAttributes = vi.fn(() => undefined);
            ctrl.data = {};
            ctrl.$onInit();

            expect(ctrl.refresh).toHaveBeenCalled();
            expect(ctrl.parseAttributes).toHaveBeenCalled();
        });

        it('should correct init ctrl if source is mobile', () => {
            cartService.setStateInfo = vi.fn();
            ctrl.refresh = vi.fn();
            ctrl.parseAttributes = vi.fn(() => {
                ctrl.data = {
                    source: 'mobile',
                };
            });

            ctrl.$onInit();

            expect(cartService.setStateInfo).toHaveBeenCalledWith(true);
            expect(ctrl.refresh).toHaveBeenCalled();
            expect(ctrl.parseAttributes).toHaveBeenCalled();
        });

        it('should correct subscribe to events', () => {
            cartService.setStateInfo = vi.fn();
            ctrl.refresh = vi.fn();
            ctrl.parseAttributes = vi.fn(() => undefined);
            ctrl.data = {
                offerId: 123,
                productId: 1,
            };

            customOptionsService.getSelectedOptions = vi.fn();
            cartService.findInCart = vi.fn();

            ctrl.$onInit();

            expect(ctrl.refresh).toHaveBeenCalledTimes(1);
            expect(customOptionsService.getSelectedOptions).not.toHaveBeenCalled();
            expect(cartService.findInCart).not.toHaveBeenCalled();

            PubSub.publish('cart.updateAmount');
            expect(ctrl.refresh).toHaveBeenCalledTimes(2);
            PubSub.publish('cart.remove', 123);
            expect(ctrl.refresh).toHaveBeenCalledTimes(3);
            PubSub.publish('cart.clear');
            expect(ctrl.refresh).toHaveBeenCalledTimes(4);
            PubSub.publish('product.customOptions.change', { productId: 1, offerId: 123, items: [] });
            expect(customOptionsService.getSelectedOptions).toHaveBeenCalled();
            expect(cartService.findInCart).toHaveBeenCalled();
        });
        it('should not call callback in subscribe if not this product', () => {
            cartService.setStateInfo = vi.fn();
            ctrl.refresh = vi.fn();
            ctrl.parseAttributes = vi.fn(() => undefined);
            ctrl.data = {
                offerId: 123,
                productId: 1,
            };

            customOptionsService.getSelectedOptions = vi.fn();
            cartService.findInCart = vi.fn();

            ctrl.$onInit();

            expect(ctrl.refresh).toHaveBeenCalledTimes(1);
            expect(customOptionsService.getSelectedOptions).not.toHaveBeenCalled();
            expect(cartService.findInCart).not.toHaveBeenCalled();

            PubSub.publish('cart.remove', 444);
            expect(ctrl.refresh).toHaveBeenCalledTimes(1);
            PubSub.publish('product.customOptions.change', { productId: 2, offerId: 123, items: [] });
            expect(customOptionsService.getSelectedOptions).not.toHaveBeenCalled();
            expect(cartService.findInCart).not.toHaveBeenCalled();
        });
        it('should check state after change custom options', () => {
            const [product] = cartDataWithCustomOptions.CartProducts;
            $httpBackend.whenPOST('/cart/getCart', { rnd }).respond(200, cartDataWithCustomOptions);
            cartService.setStateInfo = vi.fn();
            ctrl.parseAttributes = vi.fn(() => undefined);
            ctrl.data = {
                offerId: product.OfferId,
                productId: product.ProductId,
                cartAddType: cartAddConfigDefault.cartAddType.WithSpinbox,
            };

            ctrl.$onInit();
            $httpBackend.flush();

            customOptionsService.getSelectedOptions = vi.fn().mockReturnValue(product.SelectedOptions[0]);
            PubSub.publish('product.customOptions.change', { productId: product.ProductId, offerId: product.OfferId });

            expect(ctrl.state).toEqual('add');
        });
    });
    describe('parseAttributes', () => {
        it.each([
            { key: 'forceHiddenPopup', value: cartAddAttrsAll.forceHiddenPopup },
            { key: 'hideShipping', value: cartAddAttrsAll.hideShipping },
            { key: 'lpId', value: cartAddAttrsAll.lpId.toString() },
            { key: 'lpUpId', value: cartAddAttrsAll.lpUpId.toString() },
            { key: 'lpEntityId', value: cartAddAttrsAll.lpEntityId.toString() },
            { key: 'lpEntityType', value: cartAddAttrsAll.lpEntityType },
            { key: 'lpBlockId', value: cartAddAttrsAll.lpBlockId.toString() },
            { key: 'lpButtonName', value: cartAddAttrsAll.lpButtonName },
            { key: 'maxStepSpinbox', value: cartAddAttrsAll.maxStepSpinbox },
            { key: 'minStepSpinbox', value: cartAddAttrsAll.minStepSpinbox },
            { key: 'stepSpinbox', value: cartAddAttrsAll.stepSpinbox },
            { key: 'mode', value: cartAddAttrsAll.mode },
            { key: 'modeFrom', value: cartAddAttrsAll.modeFrom },
            { key: 'source', value: cartAddAttrsAll.source },
        ])('should correct parse static attr "$key"', ({ key, value }) => {
            $httpBackend.whenPOST('/cart/getCart', { rnd }).respond(200, cartData);

            const newScope = $rootScope.$new();

            const anchorElement = document.createElement('a');
            anchorElement.dataset.cartAdd = '';
            anchorElement.dataset[key] = value;

            const element = $compile(anchorElement)(newScope);
            const elementScope = element.scope();
            newScope.$digest();

            expect(elementScope.cartAdd.data[key]).toEqual(value);
        });

        it.each([
            { key: 'offerId', value: cartAddAttrsAll.offerId, newValue: 2 },
            { key: 'productId', value: cartAddAttrsAll.productId, newValue: 2 },
            { key: 'amount', value: cartAddAttrsAll.amount, newValue: 123 },
            {
                key: 'attributesXml',
                value: cartAddAttrsAll.attributesXml,
                newValue: {
                    newProp: 'newPropValue',
                },
            },
            { key: 'payment', value: cartAddAttrsAll.payment, newValue: 'mypayment' },
            { key: 'cartAddType', value: cartAddAttrsAll.cartAddType, newValue: 1 },
            { key: 'offerIds', value: cartAddAttrsAll.offerIds, newValue: [22, 33] },
        ])('should correct parse watched attr "$key" and update after change data', ({ key, value, newValue }) => {
            $httpBackend.whenPOST('/cart/getCart', { rnd }).respond(200, cartData);

            const newScope = $rootScope.$new();

            $rootScope[key] = cartAddAttrsAll[key];

            const anchorElement = document.createElement('a');
            anchorElement.dataset.cartAdd = '';
            anchorElement.dataset[key] = key;

            const element = $compile(anchorElement)(newScope);
            const elementScope = element.scope();
            newScope.$digest();

            expect(elementScope.cartAdd.data[key]).toEqual(value);

            $rootScope[key] = newValue;
            elementScope.$digest();

            expect(elementScope.cartAdd.data[key]).toEqual(newValue);
        });

        it('should correct parse watched attr "href" and update after change ng-href', () => {
            $httpBackend.whenPOST('/cart/getCart', { rnd }).respond(200, cartData);

            const newScope = $rootScope.$new();

            $rootScope.newHref = 'initHref';

            const anchorElement = document.createElement('a');
            anchorElement.dataset.cartAdd = '';
            anchorElement.dataset.ngHref = '{{newHref}}';
            anchorElement.href = 'initHref';

            const element = $compile(anchorElement)(newScope);
            const elementScope = element.scope();

            newScope.$digest();

            expect(elementScope.cartAdd.data.href).toEqual('initHref');

            $rootScope.newHref = cartAddAttrsAll.href;
            elementScope.$digest();

            expect(elementScope.cartAdd.data.href).toEqual(cartAddAttrsAll.href);
        });
    });

    describe('refresh', () => {
        it('should get from cache when params is true', async () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);

            ctrl.data = {
                productId: cartData.CartProducts[0].ProductId,
            };

            ctrl.refresh(true);
            $httpBackend.flush();
            expect(ctrl.needAdd).toBeFalsy();
            expect(ctrl.productCartData).toEqual(cartData.CartProducts[0]);

            cartService.getData = vi.fn(() => Promise.resolve(cartData));
            await ctrl.refresh(true);
            expect(cartService.getData).toHaveBeenCalledWith(true);
        });
        it('should not get from cache when params is false', async () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);

            ctrl.data = {
                productId: cartData.CartProducts[0].ProductId,
            };

            ctrl.refresh();
            $httpBackend.flush();

            expect(ctrl.needAdd).toBeFalsy();
            expect(ctrl.productCartData).toEqual(cartData.CartProducts[0]);

            cartService.getData = vi.fn(() => Promise.resolve(cartData));
            await ctrl.refresh(false);
            expect(cartService.getData).toHaveBeenCalledWith(false);
        });

        it('should correct refresh cart data without data and request return empty array', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, {
                CartProducts: [],
            });

            ctrl.data = {
                productId: cartData.CartProducts[0].ProductId,
            };

            ctrl.refresh();
            $httpBackend.flush();

            expect(ctrl.productCartData).toEqual(null);
            expect(ctrl.needAdd).toBeTruthy();
        });

        it('should correct set productCartData and needAdd property, when found in cart', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);

            ctrl.cartData = cartData;

            ctrl.data = {
                productId: cartData.CartProducts[0].ProductId,
            };
            ctrl.needAdd = true;

            ctrl.refresh();

            $httpBackend.flush();
            expect(ctrl.needAdd).toBeFalsy();
            expect(ctrl.productCartData).toEqual(cartData.CartProducts[0]);
        });

        it('should set productCartData null and needAdd property, when not found in cart', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);

            ctrl.cartData = cartData;

            ctrl.needAdd = true;

            ctrl.data = {
                productId: '30',
            };

            ctrl.refresh();
            $httpBackend.flush();

            expect(ctrl.needAdd).toBeTruthy();
            expect(ctrl.productCartData).toEqual(null);
        });
        it('should find in cart by custom options', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartDataWithCustomOptions);

            ctrl.cartData = cartData;

            ctrl.data = {
                productId: cartDataWithCustomOptions.CartProducts[1].ProductId,
                offerId: cartDataWithCustomOptions.CartProducts[1].OfferId,
            };
            ctrl.needAdd = true;
            ctrl.productSelectedOptions = evaluatedCustomOptionsToCustomOptionItemMapper(cartDataWithCustomOptions.CartProducts[1].SelectedOptions);
            ctrl.refresh();

            $httpBackend.flush();
            expect(ctrl.needAdd).toBeFalsy();
            expect(ctrl.productCartData).toEqual(cartDataWithCustomOptions.CartProducts[1]);
        });
    });
    describe('updateAmount', () => {
        it('should not call if state is loading', () => {
            cartService.removeItem = vi.fn(() => Promise.resolve());

            cartService.updateAmount = vi.fn(() => Promise.resolve());
            ctrl.addItem = vi.fn(() => Promise.resolve());

            ctrl.state = cartAddConfigDefault.cartStateButton.loading;
            ctrl.productCartData = {
                Amount: 0,
            };

            ctrl.updateAmount(cartData.CartProducts[0].ProductId, 10);

            $scope.$apply();

            expect(cartService.removeItem).not.toHaveBeenCalled();
            expect(cartService.updateAmount).not.toHaveBeenCalled();
            expect(ctrl.addItem).not.toHaveBeenCalled();
        });

        it('should correct remove item, when amount < min amount', () => {
            const newCartData = {
                CartProducts: [
                    {
                        ProductId: 2,
                    },
                    {
                        ProductId: 3,
                    },
                ],
            };
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, newCartData);

            cartService.removeItem = vi.fn(() => $q.resolve());

            cartService.updateAmount = vi.fn();

            moduleService.update = vi.fn();

            ctrl.isLoading = false;
            ctrl.needAdd = false;

            const productCartData = {
                Amount: 0,
                ShoppingCartItemId: 22,
                productId: '1',
                MinAmount: 1,
            };
            ctrl.productCartData = productCartData;

            ctrl.data = {
                productId: '1',
            };

            ctrl.updateAmount(1, 10);

            expect(ctrl.isLoading).toBeTruthy();

            expect(cartService.removeItem).toHaveBeenCalledWith(productCartData.ShoppingCartItemId);
            expect(cartService.updateAmount).not.toHaveBeenCalled();

            $httpBackend.flush();

            expect(moduleService.update).toHaveBeenCalledWith('fullcartmessage');
            expect(ctrl.productCartData).toEqual(null);

            expect(ctrl.needAdd).toBeTruthy();
            expect(ctrl.isLoading).toBeFalsy();
        });

        it('should not remove, when amount == min amount', () => {
            const newCartData = {
                CartProducts: [
                    {
                        ProductId: 2,
                    },
                    {
                        ProductId: 3,
                    },
                ],
            };
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, newCartData);

            cartService.removeItem = vi.fn(() => $q.resolve());

            cartService.updateAmount = vi.fn(() => $q.resolve());

            moduleService.update = vi.fn();

            ctrl.isLoading = false;
            ctrl.needAdd = false;

            const productCartData = {
                Amount: 2,
                ShoppingCartItemId: 22,
                productId: '1',
                MinAmount: 2,
            };
            ctrl.productCartData = productCartData;

            ctrl.data = {
                productId: '1',
            };

            ctrl.updateAmount(1, 10);

            expect(ctrl.isLoading).toBeTruthy();

            expect(cartService.removeItem).not.toHaveBeenCalled();
            expect(cartService.updateAmount).toHaveBeenCalledWith([
                {
                    Key: 10,
                    Value: 1,
                },
            ]);
        });

        it('should correct update item', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);

            cartService.removeItem = vi.fn();

            cartService.updateAmount = vi.fn(() => $q.resolve());
            ctrl.addItem = vi.fn();

            moduleService.update = vi.fn();

            ctrl.isLoading = false;
            ctrl.needAdd = false;

            ctrl.productCartData = {
                Amount: 2,
                ShoppingCartItemId: 22,
            };

            ctrl.data = {
                productId: cartData.CartProducts[0].ProductId,
            };

            ctrl.updateAmount(cartData.CartProducts[0].ProductId, 10);

            expect(ctrl.isLoading).toBeTruthy();

            expect(cartService.updateAmount).toHaveBeenCalledWith([
                {
                    Key: 10,
                    Value: cartData.CartProducts[0].ProductId,
                },
            ]);

            expect(cartService.removeItem).not.toHaveBeenCalled();

            $httpBackend.flush();

            expect(moduleService.update).toHaveBeenCalledWith('minicartmessage');
            expect(ctrl.needAdd).toBeFalsy();
        });

        it('should correct add item when fast quickly called several times', () => {
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, cartData);

            cartService.removeItem = vi.fn();

            cartService.updateAmount = vi.fn(() => $q.resolve());

            moduleService.update = vi.fn(() => $q.resolve());

            ctrl.isLoading = false;

            ctrl.productCartData = {
                Amount: 2,
                ShoppingCartItemId: 22,
            };

            ctrl.data = {
                productId: '1',
            };

            ctrl.updateAmount(1, 10);
            ctrl.updateAmount(1, 10);

            expect(ctrl.isLoading).toBeTruthy();
            expect(cartService.updateAmount).toHaveBeenCalled();
            expect(cartService.removeItem).not.toHaveBeenCalled();

            $httpBackend.flush();

            expect(ctrl.isLoadingAdd).toBeFalsy();
            expect(ctrl.isLoading).toBeFalsy();
        });

        it('should not update amount if addItem is not resolved', async () => {
            cartService.removeItem = vi.fn();
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));

            cartService.updateAmount = vi.fn(() => Promise.resolve());

            moduleService.update = vi.fn(() => Promise.resolve());

            ctrl.isLoading = false;

            ctrl.productCartData = {
                Amount: 2,
                ShoppingCartItemId: 22,
            };

            ctrl.data = {
                productId: '1',
            };

            const result = ctrl.addItem(mouseEventClick);
            ctrl.updateAmount(1, 10);

            expect(ctrl.isLoadingAdd).toBeTruthy();
            expect(ctrl.isLoading).toBeFalsy();
            expect(cartService.updateAmount).not.toHaveBeenCalled();
            expect(cartService.removeItem).not.toHaveBeenCalled();

            await result;

            expect(ctrl.isLoadingAdd).toBeFalsy();
            expect(ctrl.isLoading).toBeFalsy();
        });
    });

    describe('addItem', () => {
        let addToCartFn = vi.fn();
        let cartAddFn = vi.fn();
        let cartAddFnv2 = vi.fn();

        beforeEach(() => {
            addToCartFn = vi.fn();
            cartAddFn = vi.fn();
            cartAddFnv2 = vi.fn();

            PubSub.subscribe('add_to_cart', addToCartFn);
            PubSub.subscribe('cart.add', cartAddFn);
            PubSub.subscribe('cart.addv2', cartAddFnv2);

            moduleService.update = vi.fn(() => Promise.resolve());
        });

        afterEach(() => {
            PubSub.clear();
        });

        it('should the correct add item, when valid function is null', async () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));

            ctrl.data = {
                cartAddValid: null,
            };

            const result = await ctrl.addItem(mouseEventClick);

            expect(cartService.addItem).toHaveBeenCalled();
            expect(result).toEqual(addItemServiceResultSucess);
        });

        it.each([
            {
                cartAddValidResult: false,
                countCall: 0,
                expected: undefined,
            },
            {
                cartAddValidResult: true,
                countCall: 1,
                expected: addItemServiceResultSucess,
            },
        ])('should the correct add item, when valid function return $cartAddValidResult', async ({ cartAddValidResult, countCall, expected }) => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));

            ctrl.data = {
                cartAddValid: vi.fn(() => cartAddValidResult),
            };

            const result = await ctrl.addItem(mouseEventClick);

            expect(ctrl.data.cartAddValid).toHaveBeenCalled();
            expect(cartService.addItem).toHaveBeenCalledTimes(countCall);
            expect(result).toEqual(expected);
        });

        it('should the correct add item and return data', async () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));

            ctrl.data = cartAddAttrsAll;

            const result = await ctrl.addItem(mouseEventClick);

            expect(cartService.addItem).toHaveBeenCalledWith(cartAddAttrsAll);

            expect(result).toEqual(addItemServiceResultSucess);
        });

        it('should call refresh', async () => {
            ctrl.refresh = vi.fn();
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));

            ctrl.data = cartAddAttrsAll;

            const result = await ctrl.addItem(mouseEventClick);

            expect(cartService.addItem).toHaveBeenCalledWith(cartAddAttrsAll);
            expect(ctrl.refresh).toHaveBeenCalled();

            expect(result).toEqual(addItemServiceResultSucess);
        });

        it('should the correct publish to PubSub, when success status', async () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));

            ctrl.data = cartAddAttrsAll;

            await ctrl.addItem(mouseEventClick);

            expect(addToCartFn).toHaveBeenCalledWith(cartAddAttrsAll.href);
            expect(cartAddFn).toHaveBeenCalledWith(
                cartAddAttrsAll.offerId,
                cartAddAttrsAll.productId,
                cartAddAttrsAll.amount,
                cartAddAttrsAll.attributesXml,
                addItemServiceResultSucess[0].cartId,
                targetElement,
            );
            expect(cartAddFnv2).toHaveBeenCalledWith(
                cartAddAttrsAll.productId,
                addItemServiceResultSucess[0].cartId,
                addItemServiceResultSucess[0].CartItem,
                targetElement,
            );
        });

        it('should the correct update module "minicartmessage" and  "fullcartmessage", when success status', async () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));

            ctrl.data = cartAddAttrsAll;

            await ctrl.addItem(mouseEventClick);
            expect(moduleService.update).toHaveBeenCalledWith(['minicartmessage', 'fullcartmessage']);
        });

        it('should the correct change location, when redirect status', async () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultRedirect));
            Object.defineProperty($window, 'location', {
                value: { assign: vi.fn() },
            });

            ctrl.data = cartAddAttrsAll;

            await ctrl.addItem(mouseEventClick);

            expect($window.location.assign).toHaveBeenCalledWith(ctrl.data.href);
        });

        it('should the correct change location, when redirect status and has url redirect', async () => {
            const addItemServiceResultRedirectWithUrl = [
                {
                    ...addItemServiceResultRedirect[0],
                    url: 'example',
                },
                addItemServiceResultRedirect[1],
            ];

            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultRedirectWithUrl));
            Object.defineProperty($window, 'location', {
                value: { assign: vi.fn() },
            });

            ctrl.data = cartAddAttrsAll;

            await ctrl.addItem(mouseEventClick);

            expect($window.location.assign).toHaveBeenCalledWith('example');
        });

        it('should call function show popup, when success status', async () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));
            ctrl.showInfo = vi.fn();
            ctrl.data = { ...cartAddAttrsAll, source: 'mobile' };

            await ctrl.addItem(mouseEventClick);

            expect(ctrl.showInfo).toHaveBeenCalled();
        });
        it('should not call function show popup, when redirect status', async () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultRedirect));

            ctrl.showInfo = vi.fn();
            ctrl.source = 'mobile';

            Object.defineProperty($window, 'location', {
                value: { assign: vi.fn() },
            });

            ctrl.data = cartAddAttrsAll;

            await ctrl.addItem(mouseEventClick);

            expect(ctrl.showInfo).not.toHaveBeenCalled();
        });
        it('should the correct add item, when fast quickly called several times ', () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));

            ctrl.data = cartAddAttrsAll;

            ctrl.addItem(mouseEventClick);

            expect(cartService.addItem).toHaveBeenCalledTimes(1);
            expect(ctrl.isLoadingAdd).toBeTruthy();

            const result2 = ctrl.addItem(mouseEventClick);

            try {
                $timeout.flush();
                $rootScope.$digest();
            } catch (_e) {
                process.stderr.write('catch flush error\r\n');
            }
            expect(cartService.addItem).toHaveBeenCalledTimes(1);
            expect(ctrl.isLoadingAdd).toBeTruthy();
            expect(result2.$$state.value).toEqual(null);
        });
    });

    describe('showInfo', () => {
        it('should call function show popup in mobile and is not WithSpinbox type', async () => {
            cartService.showInfoWithDebounce = vi.fn(() => Promise.resolve());

            ctrl.isLoading = false;

            ctrl.productCartData = {
                Amount: 2,
                ShoppingCartItemId: 22,
            };

            ctrl.data = {
                productId: '1',
                source: 'mobile',
            };

            ctrl.showInfo();

            expect(cartService.showInfoWithDebounce).toHaveBeenCalled();

            ctrl.data = {
                ...ctrl.data,
                cartAddType: cartAddConfigDefault.cartAddType.WithSpinbox,
            };
            cartService.showInfoWithDebounce.mockClear();
            ctrl.showInfo();
            expect(cartService.showInfoWithDebounce).not.toHaveBeenCalled();
        });
    });
    describe('popoverModule', () => {
        it('should not show, when getModule return null', async () => {
            moduleService.getModule = vi.fn();
            popoverService.getPopoverScope = vi.fn(() =>
                Promise.resolve({
                    active: vi.fn(),
                    updatePosition: vi.fn(),
                    deactive: vi.fn(),
                }),
            );

            expect(popoverService.getPopoverScope).not.toHaveBeenCalled();

            ctrl.popoverModule(['exampleContent']);

            try {
                await $timeout.flush();
                $rootScope.$digest();
            } catch (_e) {
                process.stderr.write('catch flush error\r\n');
            }

            expect(popoverService.getPopoverScope).not.toHaveBeenCalled();
        });
        it('should not show, when content empty', async () => {
            moduleService.getModule = vi.fn(() => ({ prop: 1 }));
            popoverService.getPopoverScope = vi.fn(() =>
                Promise.resolve({
                    active: vi.fn(),
                    updatePosition: vi.fn(),
                    deactive: vi.fn(),
                }),
            );

            expect(popoverService.getPopoverScope).not.toHaveBeenCalled();

            ctrl.popoverModule(['']);

            try {
                await $timeout.flush();
                $rootScope.$digest();
            } catch (_e) {
                process.stderr.write('catch flush error\r\n');
            }

            expect(popoverService.getPopoverScope).not.toHaveBeenCalled();
        });
        it('should correct active popover', async () => {
            const popoverScope = {
                active: vi.fn(),
                updatePosition: vi.fn(),
                deactive: vi.fn(),
            };
            moduleService.getModule = vi.fn(() => 'any');
            popoverService.getPopoverScope = vi.fn(() => Promise.resolve(popoverScope));

            expect(popoverService.getPopoverScope).not.toHaveBeenCalled();

            await ctrl.popoverModule(['exampleContent']);

            await $timeout.flush();
            $rootScope.$digest();

            expect(popoverService.getPopoverScope).toHaveBeenCalled();
            expect(popoverScope.active).toHaveBeenCalled();
            expect(popoverScope.updatePosition).toHaveBeenCalled();
            expect(popoverScope.deactive).not.toHaveBeenCalled();

            await ctrl.popoverModule(['exampleContent']);

            await $timeout.flush();
            $rootScope.$digest();

            expect(popoverScope.deactive).toHaveBeenCalled();
        });
    });

    describe('checkSizeAndColor', () => {
        it('should not call, when offer is null', () => {
            cartService.setStateInfo = vi.fn();
            ctrl.refresh = vi.fn();
            ctrl.parseAttributes = vi.fn(() => undefined);
            ctrl.data = {
                offerId: 123,
                productId: 1,
            };

            customOptionsService.getSelectedOptions = vi.fn();
            cartService.findInCart = vi.fn();

            ctrl.checkSizeAndColor({}, 'color', {});

            expect(cartService.findInCart).not.toHaveBeenCalled();
        });

        it('should not call, when productId not equal', () => {
            cartService.setStateInfo = vi.fn();
            ctrl.refresh = vi.fn();
            ctrl.parseAttributes = vi.fn(() => undefined);
            ctrl.data = {
                offerId: 123,
                productId: 1,
            };

            customOptionsService.getSelectedOptions = vi.fn();
            cartService.findInCart = vi.fn();

            ctrl.checkSizeAndColor({}, 'color', {
                offer: {
                    ProductId: 2,
                },
            });

            expect(cartService.findInCart).not.toHaveBeenCalled();
        });

        it('should find product in cart by offer', () => {
            cartService.setStateInfo = vi.fn();
            ctrl.refresh = vi.fn();
            ctrl.parseAttributes = vi.fn(() => undefined);
            ctrl.data = {
                offerId: 123,
                productId: 1,
            };

            customOptionsService.getSelectedOptions = vi.fn();
            const resultFind = {
                OfferId: 134,
                productId: 1,
            };
            cartService.findInCart = vi.fn(() => resultFind);

            ctrl.checkSizeAndColor({}, 'color', {
                offer: {
                    ProductId: 1,
                },
            });

            expect(cartService.findInCart).toHaveBeenCalled();
            expect(ctrl.productCartData).toEqual(resultFind);
        });
    });

    describe('getStateButton', () => {
        it('initial state "add"', () => {
            ctrl.refresh = vi.fn();
            ctrl.parseAttributes = vi.fn(() => undefined);
            ctrl.data = {};

            ctrl.$onInit();
            expect(ctrl.getStateButton()).toEqual(cartAddConfigDefault.cartStateButton.add);
        });

        it('get "add" state, after  remove item', async () => {
            const newCartData = {
                CartProducts: [
                    {
                        ProductId: 2,
                    },
                    {
                        ProductId: 3,
                    },
                ],
            };
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, newCartData);

            cartService.removeItem = vi.fn(() => Promise.resolve());

            ctrl.isLoading = false;
            ctrl.needAdd = false;
            ctrl.refresh = vi.fn();

            ctrl.productCartData = {
                Amount: 0,
                ShoppingCartItemId: 22,
                productId: '1',
                MinAmount: 1,
            };

            ctrl.data = {
                productId: '1',
            };

            await ctrl.updateAmount(1, 10);

            expect(ctrl.getStateButton()).toEqual(cartAddConfigDefault.cartStateButton.add);
        });

        it('get "loading" state, after send request and before complete', async () => {
            const newCartData = {
                CartProducts: [
                    {
                        ProductId: 2,
                    },
                    {
                        ProductId: 3,
                    },
                ],
            };
            $httpBackend.expectPOST('/cart/getCart', { rnd }).respond(200, newCartData);

            cartService.removeItem = vi.fn(() => Promise.resolve());

            ctrl.isLoading = false;
            ctrl.needAdd = false;
            ctrl.refresh = vi.fn();

            ctrl.productCartData = {
                Amount: 0,
                ShoppingCartItemId: 22,
                productId: '1',
                MinAmount: 1,
            };

            ctrl.data = {
                productId: '1',
            };

            const promise = ctrl.updateAmount(1, 10);

            expect(ctrl.getStateButton()).toEqual(cartAddConfigDefault.cartStateButton.loading);

            await promise;

            expect(ctrl.getStateButton()).toEqual(cartAddConfigDefault.cartStateButton.add);
        });

        it('get "update" state, after add item ', async () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));
            $httpBackend.whenPOST('/cart/getCart', { rnd }).respond(200, cartData);

            ctrl.data = {
                productId: cartData.CartProducts[0].ProductId,
                cartAddType: cartAddConfigDefault.cartAddType.WithSpinbox,
            };

            await ctrl.addItem(mouseEventClick);
            $httpBackend.flush();

            expect(ctrl.getStateButton()).toEqual(cartAddConfigDefault.cartStateButton.update);
        });

        it('get "add" state, when cart add type classic ', async () => {
            cartService.addItem = vi.fn(() => Promise.resolve(addItemServiceResultSucess));
            $httpBackend.whenPOST('/cart/getCart', { rnd }).respond(200, cartData);

            ctrl.data = {
                productId: cartData.CartProducts[0].ProductId,
                cartAddType: cartAddConfigDefault.cartAddType.Classic,
            };

            await ctrl.addItem(mouseEventClick);
            $httpBackend.flush();

            expect(ctrl.getStateButton()).toEqual(cartAddConfigDefault.cartStateButton.add);
        });
    });
});
