import { vi, describe, beforeEach, it, expect, afterEach } from 'vitest';
import lozadAdvModule from './lozadAdv.module.js';
import { intersectionList, TestIntersectionObserverEntry } from '@/tests/mocks/globals';
import { createTestApp } from '@/tests/mocks/angularjs-mocks.js';
import { LozadAdvScope } from '@/scripts/_common/lozad-adv/types';

const getTarget = (selector = '#target') => {
    const target = document.querySelector(selector);

    if (!target) {
        throw new Error('target is undefined');
    }

    return target;
};

describe('LozadAdv', () => {
    const getTestApp = () => createTestApp([lozadAdvModule]);

    beforeEach(() => {
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 1000,
        });
    });

    afterEach(() => {
        intersectionList.length = 0;
    });

    it('should call callback fn with true, when element in viewport', () => {
        document.body.innerHTML = `
      <div id="target"
           lozad-adv="callbackScrollFn(isVisible)"
           lozad-adv-key="'testKey'"
           lozad-adv-options="{load:loadMock}"
           lozad-adv-debounce="false"></div>`;

        const { render } = getTestApp();
        const props = {
            callbackScrollFn: vi.fn(() => null),
            loadMock: vi.fn(),
        };

        const { scope } = render(document.body, props);
        const target = getTarget();
        const ngTarget = angular.element(target);
        ngTarget.scope<LozadAdvScope>().lozadAdv.isElementInViewport = vi.fn(() => true);

        intersectionList[0]._callbackTest(
            [
                {
                    isIntersecting: true,
                    boundingClientRect: { top: 0, right: 0, bottom: 100, left: 0, width: 100, height: 100, x: 0, y: 0 },
                    target,
                } as TestIntersectionObserverEntry,
            ],
            intersectionList[0],
        );
        scope.$apply();

        expect(props.callbackScrollFn).toHaveBeenCalledWith(true);
        expect(intersectionList[0].unobserve).toHaveBeenCalledWith(target);
    });

    it('should not call callback fn, when element is not in viewport and mode "default"', () => {
        document.body.innerHTML = `<div id="target" data-lozad-adv="callbackScrollFn(isVisible)" lozad-adv-key="test" data-lozad-adv-options="{load:loadMock}"  lozad-adv-debounce="false"></div>`;

        const { render } = getTestApp();
        const props = {
            callbackScrollFn: vi.fn(() => null),
            loadMock: vi.fn(),
        };

        const { scope } = render(document.body, props);
        const target = getTarget();
        const ngTarget = angular.element(target);
        ngTarget.scope<LozadAdvScope>().lozadAdv.isElementInViewport = vi.fn(() => false);

        intersectionList[0]._callbackTest(
            [
                {
                    isIntersecting: false,
                    boundingClientRect: {
                        top: 1100,
                        height: 100,
                    },
                    target,
                } as TestIntersectionObserverEntry,
            ],
            intersectionList[0],
        );

        scope.$apply();
        expect(scope.callbackScrollFn).not.toHaveBeenCalled();
    });

    it('should call callback fn with false, when element is not in viewport and mode "observerAlways"', () => {
        document.body.innerHTML = `<div id="target" data-lozad-adv="callbackScrollFn(isVisible)" lozad-adv-key="test" lozad-observer-mode="'observerAlways'" data-lozad-adv-options="{load:loadMock}"  lozad-adv-debounce="false"></div>`;

        const { render } = getTestApp();
        const props = {
            callbackScrollFn: vi.fn(() => null),
            loadMock: vi.fn(),
        };

        const { scope } = render(document.body, props);

        const target = getTarget();
        const ngTarget = angular.element(target);
        ngTarget.scope<LozadAdvScope>().lozadAdv.isElementInViewport = vi.fn(() => false);

        intersectionList[0]._callbackTest(
            [
                {
                    isIntersecting: false,
                    boundingClientRect: {
                        top: 1100,
                        height: 100,
                    },
                    target,
                } as TestIntersectionObserverEntry
            ],
            intersectionList[0],
        );

        scope.$apply();
        expect(scope.callbackScrollFn).toHaveBeenCalledWith(false);
    });

    it('should not unobserve, when mode "observerAlways"', () => {
        document.body.innerHTML = `<div id="target"  data-lozad-adv="callbackScrollFn(isVisible)" lozad-adv-key="test" lozad-observer-mode="'observerAlways'" data-lozad-adv-options="{load:loadMock}"  lozad-adv-debounce="false"></div>`;

        const { render } = getTestApp();
        const props = {
            callbackScrollFn: vi.fn(() => null),
            loadMock: vi.fn(),
        };

        const { scope } = render(document.body, props);

        const target = getTarget();
        const ngTarget = angular.element(target);
        ngTarget.scope<LozadAdvScope>().lozadAdv.isElementInViewport = vi.fn(() => false);

        intersectionList[0]._callbackTest(
            [
                {
                    isIntersecting: false,
                    boundingClientRect: { top: 0, height: 100 },
                    target,
                } as TestIntersectionObserverEntry,
            ],
            intersectionList[0],
        );

        scope.$apply();
        expect(scope.callbackScrollFn).toHaveBeenCalledWith(true);
        expect(intersectionList[0].unobserve).not.toHaveBeenCalled();
    });

    it('should using one instance observer for multiple elements with equal key', () => {
        const { render } = getTestApp();
        const props = {
            callbackScrollFn: vi.fn(() => null),
            loadMock: vi.fn(),
        };

        render(
            `<div data-lozad-adv="callbackScrollFn" lozad-adv-key="'test'"></div>
            <div data-lozad-adv="callbackScrollFn" lozad-adv-key="'test'"></div>`,
            props,
        );

        expect(intersectionList.length).toBe(1);
    });

    it('should using one instance observer for multiple elements with equal options',  () => {
        const { render } = getTestApp();
        const props = {
            callbackScrollFn: vi.fn(() => null),
            loadMock: vi.fn(),
        };

        render(
            `<div data-lozad-adv="callbackScrollFn()" data-lozad-adv-options="{load:loadMock}"></div>
            <div data-lozad-adv="callbackScrollFn()" data-lozad-adv-options="{load:loadMock}"></div>`,
            props,
        );

        expect(intersectionList.length).toBe(1);
    });

    it('should using different instance observer for multiple elements with different options',  () => {
        const { render } = getTestApp();
        const props = {
            callbackScrollFn: vi.fn(() => null),
            loadMock: vi.fn(),
        };
        render(
            `<div data-lozad-adv="callbackScrollFn()" data-lozad-adv-options="{load:loadMock, customKey:123}"></div>
            <div data-lozad-adv="callbackScrollFn()" data-lozad-adv-options="{load:loadMock}"></div>`,
            props,
        );

        expect(intersectionList.length).toBe(2);
    });

    it('should using one observer for multiple different element and callbacks',  () => {
        document.body.innerHTML = `<div id="target" data-lozad-adv="callbackScrollFn(isVisible)" data-lozad-adv-options="{load:loadMock}"  lozad-adv-debounce="false"></div>
            <div id="target2" data-lozad-adv="callbackScrollFn2(isVisible)" data-lozad-adv-options="{load:loadMock}"  lozad-adv-debounce="false"></div>`;

        const { render } = getTestApp();

        const props = {
            callbackScrollFn: vi.fn(() => null),
            callbackScrollFn2: vi.fn(() => null),
            loadMock: vi.fn(),
        };

        const { scope } = render(document.body, props);
        const target = getTarget();
        const ngTarget = angular.element(target);
        ngTarget.scope<LozadAdvScope>().lozadAdv.isElementInViewport = vi.fn(() => true);

        const target2 = getTarget('#target2');
        const ngTarget2 = angular.element(target2);
        ngTarget2.scope<LozadAdvScope>().lozadAdv.isElementInViewport = vi.fn(() => true);

        intersectionList[0]._callbackTest(
            [
                {
                    isIntersecting: true,
                    boundingClientRect: {
                        top: 100,
                        height: 100,
                    },
                    target,
                } as IntersectionObserverEntry,
                {
                    isIntersecting: true,
                    boundingClientRect: {
                        top: 200,
                        height: 100,
                    },
                    target: target2,
                } as IntersectionObserverEntry,
            ],
            intersectionList[0],
        );

        scope.$apply();
        expect(intersectionList.length).toBe(1);
        expect(scope.callbackScrollFn).toHaveBeenCalled();
        expect(scope.callbackScrollFn2).toHaveBeenCalled();
    });
});
