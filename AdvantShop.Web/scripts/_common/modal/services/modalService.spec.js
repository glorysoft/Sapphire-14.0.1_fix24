import angular from 'angular';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import modalModule from '../modal.module';

describe('modalService', () => {
    let modalService, $timeout, $injector, $rootScope;

    beforeEach(() => {
        $injector = angular.injector(['ng', 'ngMock', modalModule], false);
        $timeout = $injector.get('$timeout');
        modalService = $injector.get('modalService');
        $rootScope = $injector.get('$rootScope');
    });

    describe('startWorking', () => {
        it('open first modal from queue', () => {
            const id = 'test';
            const modal1 = { id };
            modalService.open = vi.fn();
            modalService.addQueue(modal1);

            modalService.startWorking();

            expect(modalService.open).toHaveBeenCalledWith(id, true);
        });
    });

    describe('existInQueue', () => {
        describe('should check exist', () => {
            it('when empty queue', () => {
                const modal1 = {};
                expect(modalService.existInQueue(modal1)).toBeFalsy();
            });
            it('when have other modal', () => {
                const modal1 = {};
                const modal2 = {};
                modalService.addQueue(modal1);
                expect(modalService.existInQueue(modal2)).toBeFalsy();
            });
            it('when have target modal', () => {
                const modal1 = {};
                modalService.addQueue(modal1);
                expect(modalService.existInQueue(modal1)).toBeTruthy();
            });
        });
    });

    describe('removeItemQueue', () => {
        it('remove target modal', () => {
            const modal1 = {};

            modalService.addQueue(modal1);
            expect(modalService.existInQueue(modal1)).toBeTruthy();

            modalService.removeItemQueue(modal1);
            expect(modalService.existInQueue(modal1)).toBeFalsy();
        });
        it("open prev modal when it's nested modals", () => {
            const modal1 = {};
            const modal2 = { id: 'test', isOpen: false };

            modalService.open = vi.fn();

            modalService.addQueue(modal1);
            modalService.addQueue(modal2);

            modalService.removeItemQueue(modal1);

            expect(modalService.existInQueue(modal1)).toBeFalsy();
            expect(modalService.existInQueue(modal2)).toBeTruthy();
            expect(modalService.open).toHaveBeenCalledWith(modal2.id, true);
        });
    });

    describe('open', () => {
        it('should open target modal', () => {
            const modalOpenFn = vi.fn();
            const id = 'test';

            modalService.addStorage(id, angular.element(document.createElement('div')), {
                open: modalOpenFn,
            });
            modalService.open(id);

            expect(modalOpenFn).toHaveBeenCalled();
        });
        it('should pass forceOpen flag to modal scope open', () => {
            const modalOpenFn = vi.fn();
            const id = 'test';

            modalService.addStorage(id, angular.element(document.createElement('div')), {
                open: modalOpenFn,
            });
            modalService.open(id, false, undefined, true);

            expect(modalOpenFn).toHaveBeenCalledWith(false, undefined, true);
        });
        it('should pass skipQueue, modalDataAdditional and forceOpen to modal scope open', () => {
            const modalOpenFn = vi.fn();
            const id = 'test';
            const additional = { foo: 'bar' };

            modalService.addStorage(id, angular.element(document.createElement('div')), {
                open: modalOpenFn,
            });
            modalService.open(id, true, additional, true);

            expect(modalOpenFn).toHaveBeenCalledWith(true, additional, true);
        });
        it('should pass undefined forceOpen when omitted', () => {
            const modalOpenFn = vi.fn();
            const id = 'test';

            modalService.addStorage(id, angular.element(document.createElement('div')), {
                open: modalOpenFn,
            });
            modalService.open(id);

            expect(modalOpenFn).toHaveBeenCalledWith(false, undefined, undefined);
        });
        it('should force open modal even when service is not working', () => {
            const modalOpenFn = vi.fn();
            const id = 'test';

            modalService.addStorage(id, angular.element(document.createElement('div')), {
                open: modalOpenFn,
            });
            modalService.stopWorking();
            modalService.open(id, false, undefined, true);

            expect(modalOpenFn).toHaveBeenCalledWith(false, undefined, true);
        });
        it('should not call modal scope open when modal is not in storage', () => {
            const modalOpenFn = vi.fn();

            modalService.open('missing', false, undefined, true);

            expect(modalOpenFn).not.toHaveBeenCalled();
        });
    });

    describe('close', () => {
        it('should close target modal when exist', () => {
            const modalCloseFn = vi.fn();
            const id = 'test';

            modalService.addStorage(id, angular.element(document.createElement('div')), {
                close: modalCloseFn,
            });

            modalService.close(id);

            expect(modalCloseFn).toHaveBeenCalled();
        });
        it('should throw error when not exist modal', () => {
            try {
                modalService.close('error');
                $timeout.flush();
                $rootScope.$digest();
            } catch (err) {
                expect(err.message).toBe('Not found modal with id "error"');
            }
        });
    });

    describe('destroy', () => {
        it('should call scope destroy and remove from storage', () => {
            const modalDestroyFn = vi.fn();
            const id = 'test';

            modalService.addStorage(id, angular.element(document.createElement('div')), {
                destroy: modalDestroyFn,
            });

            modalService.destroy(id);

            expect(modalDestroyFn).toHaveBeenCalled();
            expect(modalService.hasModal(id)).toBeFalsy();
        });
    });

    describe('renderAttributes', () => {
        it('should return normalize attributes for DOM', () => {
            const options = {
                CamelCaseTesting: '1231b',
                kebabCaseTesting: '1231b',
                booleanValue: false,
                numberValue: 1,
                valueKebab: 'valueTesting',
                array: [1, 2, 3, 4, 5],
                object: { nested: 1, nested2: 'asd' },
                nullProp: null,
                undefinedProp: undefined,
            };
            const result = modalService.renderAttrubutes(options);
            expect(result).toEqual(
                `camel-case-testing=\"1231b\" kebab-case-testing=\"1231b\" boolean-value=\"false\" number-value=\"1\" value-kebab=\"valueTesting\" array=\"[1,2,3,4,5]\" object=\"{'nested':1,'nested2':'asd'}\"`,
            );
        });
    });

    describe('getNewIndex', () => {
        it('should index  always more between prev index in queue', () => {
            const zIndex = modalService.getNewZIndex(1);

            expect(zIndex).toBe(1);

            modalService.addQueue({});
            const zIndex2 = modalService.getNewZIndex(1);

            expect(zIndex2).toBe(2);
        });
    });

    describe('createOverlay', () => {
        it('should add overlay to DOM', () => {
            const target = document.createElement('div');
            target.classList.add('test');
            document.body.insertAdjacentElement('afterbegin', target);
            modalService.createOverlay(target, 2);

            expect(target.previousSibling.classList.contains('adv-modal-overlay')).toBeTruthy();
        });
    });
});
