import { vi, describe, beforeEach, it, expect } from 'vitest';
import lozadAdvModule from './lozadAdv.module.js';
import { ILozadAdvService } from './lozadAdv.service';
import { LozadAdvObserverParams } from './types';
import { LOZAD_OBSERVER_MODE } from './lozadAdv.constants';
import '../../../tests/mocks/globals';
import { createTestApp } from '@/tests/mocks/angularjs-mocks';


const getTarget = () => {
    const target = document.querySelector<HTMLElement>('#target');
    if (!target) {
        throw new Error('target is undefined');
    }
    return target;
};

describe('LozadAdvService', () => {
    let lozadAdvService: ILozadAdvService, lozadAdvDefault, $injector;

    document.body.innerHTML = `
        <div id="target" style="width:100px; height:100px"></div>
        <div id="target2" style="width:100px; height:100px"></div>
    `;

    const getDefaultParams = (params?: Partial<LozadAdvObserverParams>): LozadAdvObserverParams => ({
        lozadAdvKey: 'init',
        options: lozadAdvDefault,
        lozadObserverMode: LOZAD_OBSERVER_MODE.default,
        ...params,
    });

    const getTestApp = () => createTestApp([lozadAdvModule]);

    beforeEach(() => {
        $injector = getTestApp().$injector;
        lozadAdvDefault = $injector.get('lozadAdvDefault');
        lozadAdvService = $injector.get('lozadAdvService');
    });

    describe('initObserver', () => {
        it('should init observer and return instance', () => {
            const target = getTarget();
            const callback = vi.fn();
            const instance = lozadAdvService.initObserver(getDefaultParams());
            instance.observeWrapper(target, callback);
            expect(global.IntersectionObserver).toHaveBeenCalled();
            expect(instance.observer.observe).toHaveBeenCalledWith(target);
        });

        it('should return exist observer by key', () => {
            const target = getTarget();
            const callback = vi.fn();

            const instance = lozadAdvService.initObserver(getDefaultParams());
            instance.observeWrapper(target, callback);

            expect(instance.observer.observe).toHaveBeenCalledWith(target);
            expect(instance.observer.observe).toHaveBeenCalledTimes(1);

            const instanceEqual = lozadAdvService.initObserver(getDefaultParams());
            instanceEqual.observeWrapper(target, callback);

            expect(instanceEqual.observer.observe).toHaveBeenCalledWith(target);
            expect(instanceEqual.observer.observe).toHaveBeenCalledTimes(2);

            const instanceOther = lozadAdvService.initObserver(getDefaultParams({ lozadAdvKey: 'initOther' }));
            instanceOther.observeWrapper(target, callback);

            expect(instanceOther.observer.observe).toHaveBeenCalledWith(target);
            expect(instanceOther.observer.observe).not.toBe(instance.observer);
        });

        it('should return exist observer by options', () => {
            const instance = lozadAdvService.initObserver(getDefaultParams({ lozadAdvKey: undefined }));

            const instanceEqual = lozadAdvService.initObserver(getDefaultParams({
                lozadAdvKey: undefined,
                options: { ...lozadAdvDefault },
            }));
            expect(instance.observerId).toBe(instanceEqual.observerId);

            const instanceOther = lozadAdvService.initObserver(
                getDefaultParams({
                    lozadAdvKey: undefined,
                    options: { ...lozadAdvDefault, customProp: 'test' },
                }),
            );
            expect(instance.observerId).not.toBe(instanceOther.observerId);
        });
    });
    describe('getHash', () => {
        const options = {
            test: 1,
            prop2: 'asdasd',
            obj: {
                init: true,
                arr: ['aaa', 'bbb', 'ccc'],
            },
        };

        const options2 = {
            prop2: 'asdasd',
            obj: {
                init: true,
                arr: ['aaa', 'bbb', 'ccc'],
            },
        };

        const options3 = {
            prop2: 'asdasd',
            obj: {
                init: true,
                arr: ['ccc', 'aaa', 'bbb'],
            },
        };

        it('should return hash by options', () => {
            const hash = lozadAdvService.getHash(options);
            expect(hash.length).toBe(10);
        });

        it('should return equals hash by options', () => {
            const hash1 = lozadAdvService.getHash(options);
            const hash2 = lozadAdvService.getHash({ ...options });
            expect(hash1).toBe(hash2);
        });

        it('should return different hash by options', () => {
            const hash1 = lozadAdvService.getHash(options);
            const hash2 = lozadAdvService.getHash(options2);
            const hash3 = lozadAdvService.getHash(options3);

            expect(hash1).not.toBe(hash2);
            expect(hash1).not.toBe(hash3);
            expect(hash2).not.toBe(hash3);
        });
    });
    describe('reObserve', () => {
        it('should re-observe element', () => {
            const target = getTarget();
            const callback = vi.fn();
            const instance = lozadAdvService.initObserver(getDefaultParams());
            instance.observeWrapper(target, callback);

            expect(instance.observer.observe).toHaveBeenCalledTimes(1);

            const result = lozadAdvService.reObserve('init', target);
            expect(result).toBeTruthy();

            expect(instance.observer.unobserve).toHaveBeenCalledTimes(1);
            expect(instance.observer.observe).toHaveBeenCalledTimes(2);
        });

        it('should return falsy if observe not found', () => {
            const target = getTarget();
            expect(lozadAdvService.reObserve('other', target)).toBeFalsy();
        });
    });

    describe('onIntersection', () => {
        it('should return callback for intersection with custom load', async () => {
            const callbackMock = vi.fn();
            const callback = lozadAdvService.onIntersection(callbackMock, 1);

            callback({ isIntersecting: true } as IntersectionObserverEntry, {} as IntersectionObserver);
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve({});
                }, 1);
            });

            expect(callbackMock).toHaveBeenCalledWith({ isIntersecting: true }, {});
        });
        it('should skip debounce, when false', () => {
            const callbackMock = vi.fn();
            const callback = lozadAdvService.onIntersection(callbackMock, false);

            callback({ isIntersecting: true } as IntersectionObserverEntry, {} as IntersectionObserver);
            expect(callbackMock).toHaveBeenCalledWith({ isIntersecting: true }, {});
        });
    });

    describe('isElementInViewport', () => {
        beforeEach(() => {
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 1000,
            });
        });
        it('should return true, when element in viewport', () => {
            const target = getTarget();

            expect(
                lozadAdvService.isElementInViewport(target, {
                    boundingClientRect: {
                        top: 0,
                        height: 100,
                    },
                } as IntersectionObserverEntry),
            ).toBeTruthy();
        });
        it('should return false, when element is not in viewport', () => {
            const target = getTarget();

            expect(
                lozadAdvService.isElementInViewport(target, {
                    boundingClientRect: {
                        top: 1100,
                        height: 100,
                    },
                } as IntersectionObserverEntry),
            ).toBeFalsy();
        });
    });
});
