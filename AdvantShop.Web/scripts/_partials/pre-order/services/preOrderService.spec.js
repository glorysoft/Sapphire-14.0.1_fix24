import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import angular from 'angular';
import '../preOrder.module.js';

describe('preOrderService', () => {
    let preOrderService, $httpBackend, $rootScope, $q;
    let mockModalService, mockModal;

    beforeEach(() => {
        mockModal = { modalScope: { open: vi.fn() } };

        mockModalService = {
            open: vi.fn(),
            hasModal: vi.fn().mockReturnValue(false),
            renderModal: vi.fn().mockImplementation((_id, _header, _content, _footer, _options, scopeData) => {
                Object.assign(mockModal.modalScope, scopeData);
            }),
            getModal: vi.fn(),
            setVisibleFooter: vi.fn(),
        };

        angular
            .module('preOrderTestMocks', [])
            .value('modalService', mockModalService)
            .value('toaster', { pop: vi.fn() });

        const $injector = angular.injector(['ng', 'ngMock', 'preOrderTestMocks', 'preOrder'], false);

        preOrderService = $injector.get('preOrderService');
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $q = $injector.get('$q');

        mockModalService.getModal.mockReturnValue($q.resolve(mockModal));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('showDialog', () => {
        it('calls modalService.open with the given modalId', () => {
            preOrderService.showDialog('testModal');
            expect(mockModalService.open).toHaveBeenCalledWith('testModal');
        });
    });

    describe('renderProductViewPreorder', () => {
        it('opens existing modal when modal already exists and continues rendering', () => {
            mockModalService.hasModal.mockReturnValue(true);

            preOrderService.renderProductViewPreorder('testModal', {
                modalOptions: {},
                preorderOptions: {},
            });
            $rootScope.$digest();

            expect(mockModalService.getModal).toHaveBeenCalled();
            expect(mockModal.modalScope.open).toHaveBeenCalled();
        });

        it('calls formInit and successFn params through modalData wrappers', () => {
            const formInit = vi.fn();
            const successFn = vi.fn();
            preOrderService.renderProductViewPreorder('testModal', {
                modalOptions: {},
                preorderOptions: { formInit, successFn },
            });

            const form = { $setPristine: vi.fn() };
            mockModal.modalScope.modalData.formInit(form);
            mockModal.modalScope.modalData.successFn('/order/success');

            expect(formInit).toHaveBeenCalledWith(form);
            expect(successFn).toHaveBeenCalledWith('/order/success');
        });

        it('calls callbackClose param through modalData.callbackClose wrapper', () => {
            const callbackClose = vi.fn();
            preOrderService.renderProductViewPreorder('testModal', {
                modalOptions: { callbackClose },
                preorderOptions: {},
            });

            const modalScope = { id: 'testModal' };
            mockModal.modalScope.modalData.callbackClose(modalScope);

            expect(callbackClose).toHaveBeenCalledWith(modalScope);
        });

        it('sets offerId, productId and amount on modalData', () => {
            preOrderService.renderProductViewPreorder('testModal', {
                modalOptions: {},
                preorderOptions: { offerId: 100, productId: 42, amount: 3 },
            });

            expect(mockModal.modalScope.modalData.offerId).toBe(100);
            expect(mockModal.modalScope.modalData.productId).toBe(42);
            expect(mockModal.modalScope.modalData.amount).toBe(3);
        });

        it('opens the modal after promise resolves', () => {
            preOrderService.renderProductViewPreorder('testModal', {
                modalOptions: {},
                preorderOptions: {},
            });
            $rootScope.$digest();

            expect(mockModal.modalScope.open).toHaveBeenCalled();
        });

        describe('modalData.formInit', () => {
            it('calls preorderOptions.formInit with the form when provided', () => {
                const formInit = vi.fn();
                preOrderService.renderProductViewPreorder('testModal', {
                    modalOptions: {},
                    preorderOptions: { formInit },
                });

                const form = { $setPristine: vi.fn() };
                mockModal.modalScope.modalData.formInit(form);

                expect(formInit).toHaveBeenCalledWith(form);
            });

            it('stores form for use by callbackClose', () => {
                preOrderService.renderProductViewPreorder('testModal', {
                    modalOptions: {},
                    preorderOptions: {},
                });

                const form = { reset: vi.fn(), success: true };
                mockModal.modalScope.modalData.formInit(form);
                mockModal.modalScope.modalData.callbackClose({});

                expect(form.reset).toHaveBeenCalled();
            });

            it('does nothing when preorderOptions.formInit is not provided', () => {
                preOrderService.renderProductViewPreorder('testModal', {
                    modalOptions: {},
                    preorderOptions: {},
                });

                expect(() => mockModal.modalScope.modalData.formInit({})).not.toThrow();
            });
        });

        describe('modalData.successFn', () => {
            it('calls preorderOptions.successFn with result when provided', () => {
                const successFn = vi.fn();
                preOrderService.renderProductViewPreorder('testModal', {
                    modalOptions: {},
                    preorderOptions: { successFn },
                });

                mockModal.modalScope.modalData.successFn('http://example.com/order');

                expect(successFn).toHaveBeenCalledWith('http://example.com/order');
            });

            it('calls service.successFn(result, modalId) when preorderOptions.successFn is not provided', () => {
                preOrderService.renderProductViewPreorder('testModal', {
                    modalOptions: {},
                    preorderOptions: {},
                });

                const spy = vi.spyOn(preOrderService, 'successFn');
                mockModal.modalScope.modalData.successFn('http://example.com/order');

                expect(spy).toHaveBeenCalledWith('http://example.com/order', 'testModal');
            });
        });

        describe('modalData.callbackClose', () => {
            it('calls modalOptions.callbackClose with modalScope when provided', () => {
                const callbackClose = vi.fn();
                preOrderService.renderProductViewPreorder('testModal', {
                    modalOptions: { callbackClose },
                    preorderOptions: {},
                });

                const modalScope = { id: 'testModal' };
                mockModal.modalScope.modalData.callbackClose(modalScope);

                expect(callbackClose).toHaveBeenCalledWith(modalScope);
            });

            it('calls service.modalCallbackClose with stored form when no modalOptions.callbackClose', () => {
                preOrderService.renderProductViewPreorder('testModal', {
                    modalOptions: {},
                    preorderOptions: {},
                });

                const form = { reset: vi.fn(), success: false };
                mockModal.modalScope.modalData.formInit(form);

                const spy = vi.spyOn(preOrderService, 'modalCallbackClose');
                mockModal.modalScope.modalData.callbackClose({});

                expect(spy).toHaveBeenCalledWith(form);
            });
        });
    });

    describe('successFn', () => {
        it('does not call modalFooterShow when result is a url string', () => {
            preOrderService.successFn('/order/success', 'testModal');

            expect(mockModalService.setVisibleFooter).not.toHaveBeenCalled();
        });

        it.each([null, undefined, ''])(
            'calls modalFooterShow(modalId, false) when result is falsy (%s)',
            (result) => {
                preOrderService.successFn(result, 'testModal');

                expect(mockModalService.setVisibleFooter).toHaveBeenCalledWith('testModal', false);
            },
        );
    });

    describe('modalCallbackClose', () => {
        it('navigates to form.result.url when result is set and showRedirectButton is true', () => {
            const form = { result: { url: '/order/123' }, showRedirectButton: true, success: false, reset: vi.fn() };

            preOrderService.modalCallbackClose(form);

            expect(form.reset).not.toHaveBeenCalled();
        });

        it('does not navigate when showRedirectButton is false', () => {
            const form = { result: { url: '/order/123' }, showRedirectButton: false, success: false, reset: vi.fn() };

            preOrderService.modalCallbackClose(form);

            expect(form.reset).not.toHaveBeenCalled();
        });

        it('calls form.reset when form.success is true', () => {
            const form = { result: null, showRedirectButton: false, success: true, reset: vi.fn() };

            preOrderService.modalCallbackClose(form);

            expect(form.reset).toHaveBeenCalled();
        });

        it('does nothing when form is null', () => {
            expect(() => preOrderService.modalCallbackClose(null)).not.toThrow();
        });
    });

    describe('modalFooterShow', () => {
        it('calls modalService.setVisibleFooter with modalId and show=true', () => {
            preOrderService.modalFooterShow('testModal', true);

            expect(mockModalService.setVisibleFooter).toHaveBeenCalledWith('testModal', true);
        });

        it('calls modalService.setVisibleFooter with modalId and show=false', () => {
            preOrderService.modalFooterShow('testModal', false);

            expect(mockModalService.setVisibleFooter).toHaveBeenCalledWith('testModal', false);
        });
    });

    describe('getFormData', () => {
        it('GETs checkout/getpreorderformdata and returns response.data', () => {
            const responseData = { field: { EnableCaptchaInPreOrder: false }, data: { Email: '' } };
            $httpBackend.expectGET('checkout/getpreorderformdata').respond(200, responseData);

            let result = null;
            preOrderService.getFormData().then((data) => {
                result = data;
            });

            $httpBackend.flush();

            expect(result).toEqual(responseData);
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    describe('send', () => {
        it('POSTs to checkout/checkoutpreorder with data and returns response.data', () => {
            const requestData = { Email: 'test@example.com', ProductId: 1, OfferId: 10 };
            const responseData = { result: true, obj: '/order/success' };
            $httpBackend.expectPOST('checkout/checkoutpreorder', requestData).respond(200, responseData);

            let result = null;
            preOrderService.send(requestData).then((data) => {
                result = data;
            });

            $httpBackend.flush();

            expect(result).toEqual(responseData);
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
