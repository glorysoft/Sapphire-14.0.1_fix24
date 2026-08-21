import { describe, beforeEach, it, expect, afterEach } from 'vitest';
import '../../../../node_modules/angular-translate/dist/angular-translate.js';
import '../spinbox.module.js';
import { createTestApp } from '../../../../tests/mocks/angularjs-mocks.ts';
import { emulateNativeTyping } from '../../../../tests/utils/typing.ts';

const dispatchBlur = (el) => {
    el.dispatchEvent(new FocusEvent('blur'));
};

const clearAndType = (input, value) => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    emulateNativeTyping(input, value);
};

describe('Spinbox', () => {
    let $rootScope, $scope, $compile, $injector;

    beforeEach(() => {
        $injector = createTestApp(['pascalprecht.translate', 'spinbox']).$injector;

        $compile = $injector.get('$compile');
        $rootScope = $injector.get('$rootScope');

        $scope = $rootScope.$new();
    });

    it('should correct init', () => {
        $scope.exampleValue = 5;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-disable-correct="true"
                            data-value="exampleValue"
                            data-step="1"
                            data-max="1000"
                            data-min="0"></div>`)($scope);
        $scope.$digest();
        expect(el[0].querySelector('input').value).toEqual($scope.exampleValue.toString());
    });

    it('should not correcting value and do validate input, when enable onlyValidation', () => {
        $scope.exampleValue = 5;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-only-validation="true"
                            data-value="exampleValue"
                            data-step="1"
                            data-max="1000"
                            data-min="0"></div>`)($scope);
        $scope.$digest();
        expect(el[0].querySelector('input').value).toEqual($scope.exampleValue.toString());

        $scope.exampleValue = 5.5;
        $scope.$digest();
        const input = el[0].querySelector('input');
        dispatchBlur(input);
        expect(input.value).toEqual('5,5');
        expect(input.classList.contains('ng-invalid')).toBeTruthy();
        expect(input.classList.contains('ng-invalid-spinbox-input')).toBeTruthy();
    });

    it('should correcting value when disable onlyValidation', () => {
        $scope.exampleValue = 5;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-only-validation="false"
                            data-value="exampleValue"
                            data-step="1"
                            data-max="1000"
                            data-min="0"></div>`)($scope);
        $scope.$digest();
        expect(el[0].querySelector('input').value).toEqual($scope.exampleValue.toString());

        $scope.exampleValue = 5.5;
        $scope.$digest();
        const input = el[0].querySelector('input');
        dispatchBlur(input);
        expect(input.value).toEqual('6');
        expect(input.classList.contains('ng-invalid')).toBeFalsy();
        expect(input.classList.contains('ng-invalid-spinbox-input')).toBeFalsy();
    });

    it('should update button status when change min or min', () => {
        $scope.exampleValue = 5;
        $scope.minOut = 1;
        $scope.maxOut = 10;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-only-validation="false"
                            data-value="exampleValue"
                            data-step="1"
                            data-max="maxOut"
                            data-min="minOut"></div>`)($scope);
        $scope.$digest();
        expect(el[0].querySelector('input').value).toEqual($scope.exampleValue.toString());

        $scope.exampleValue = 5.5;
        $scope.$digest();
        const input = el[0].querySelector('input');
        const btnMore = el[0].querySelector('.spinbox-more');
        const btnLess = el[0].querySelector('.spinbox-less');
        dispatchBlur(input);
        expect(input.value).toEqual('6');
        expect(input.classList.contains('ng-invalid')).toBeFalsy();
        expect(input.classList.contains('ng-invalid-spinbox-input')).toBeFalsy();

        expect(btnMore.classList.contains('spinbox-button-disabled')).toBeFalsy();
        expect(btnLess.classList.contains('spinbox-button-disabled')).toBeFalsy();

        expect($scope.exampleValue).toEqual('6');

        $scope.maxOut = 6;
        $scope.$digest();

        expect(btnMore.classList.contains('spinbox-button-disabled')).toBeTruthy();
        expect(btnLess.classList.contains('spinbox-button-disabled')).toBeFalsy();

        $scope.minOut = 7;
        $scope.maxOut = 10;

        $scope.$digest();

        expect(btnMore.classList.contains('spinbox-button-disabled')).toBeFalsy();
        expect(btnLess.classList.contains('spinbox-button-disabled')).toBeTruthy();
    });

    it('should update value when typing from keyboard', () => {
        $scope.exampleValue = 5;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-value="exampleValue"
                            data-step="1"
                            data-max="1000"
                            data-min="0"></div>`)($scope);
        $scope.$digest();
        const input = el[0].querySelector('input');
        expect(input.value).toEqual('5');

        clearAndType(input, '6');
        $scope.$digest();

        expect(input.value).toEqual('6');
        expect($scope.exampleValue).toEqual('6');
    });

    it('should clamp keyboard-typed value to max on blur', () => {
        $scope.exampleValue = 5;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-value="exampleValue"
                            data-step="1"
                            data-max="10"
                            data-min="0"></div>`)($scope);
        $scope.$digest();
        const input = el[0].querySelector('input');

        clearAndType(input, '50');
        $scope.$digest();

        expect(input.value).toEqual('10');
        expect($scope.exampleValue).toEqual('10');
    });

    it('should clamp keyboard-typed value to min on blur', () => {
        $scope.exampleValue = 5;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-value="exampleValue"
                            data-step="1"
                            data-max="1000"
                            data-min="3"></div>`)($scope);
        $scope.$digest();
        const input = el[0].querySelector('input');

        clearAndType(input, '1');
        $scope.$digest();

        expect(input.value).toEqual('3');
        expect($scope.exampleValue).toEqual('3');
    });

    it('should correct keyboard-typed value by step on blur', () => {
        $scope.exampleValue = 5;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-value="exampleValue"
                            data-step="5"
                            data-max="1000"
                            data-min="0"></div>`)($scope);
        $scope.$digest();
        const input = el[0].querySelector('input');

        clearAndType(input, '12');
        $scope.$digest();

        expect(input.value).toEqual('15');
        expect($scope.exampleValue).toEqual('15');
    });

    it('should update button status after keyboard input reaches max', () => {
        $scope.exampleValue = 5;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-value="exampleValue"
                            data-step="1"
                            data-max="10"
                            data-min="0"></div>`)($scope);
        $scope.$digest();
        const input = el[0].querySelector('input');
        const btnMore = el[0].querySelector('.spinbox-more');
        const btnLess = el[0].querySelector('.spinbox-less');

        clearAndType(input, '10');
        $scope.$digest();

        expect(input.value).toEqual('10');
        expect(btnMore.classList.contains('spinbox-button-disabled')).toBeTruthy();
        expect(btnLess.classList.contains('spinbox-button-disabled')).toBeFalsy();
    });

    it('should invalidate keyboard input in onlyValidation mode when value not multiple of step', () => {
        $scope.exampleValue = 5;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-only-validation="true"
                            data-value="exampleValue"
                            data-step="5"
                            data-max="1000"
                            data-min="0"></div>`)($scope);
        $scope.$digest();
        const input = el[0].querySelector('input');

        clearAndType(input, '12');
        $scope.$digest();

        expect(input.value).toEqual('12');
        expect(input.classList.contains('ng-invalid')).toBeTruthy();
        expect(input.classList.contains('ng-invalid-spinbox-input')).toBeTruthy();
    });

    describe('tooltip rendering in DOM', () => {
        let el;

        beforeEach(() => {
            document.querySelectorAll('[uib-tooltip-popup]').forEach((tooltip) => tooltip.remove());
        });

        afterEach(() => {
            el[0].remove();
            document.querySelectorAll('[uib-tooltip-popup]').forEach((tooltip) => tooltip.remove());
        });

        const compileInBody = (attrs = '') => {
            el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-value="exampleValue"
                            ${attrs}></div>`)($scope);
            document.body.appendChild(el[0]);
            $scope.$digest();
            return el[0].querySelector('input');
        };

        it('should render max tooltip in body when keyboard input exceeds max', () => {
            $scope.exampleValue = 5;
            const input = compileInBody('data-step="1" data-max="10" data-min="0"');

            clearAndType(input, '50');
            $scope.$digest();

            const tooltip = document.body.querySelector('[uib-tooltip-popup]');
            expect(tooltip).not.toBeNull();
            expect(tooltip.textContent).toContain('10');
        });

        it('should render min tooltip in body when keyboard input below min', () => {
            $scope.exampleValue = 5;
            const input = compileInBody('data-step="1" data-max="1000" data-min="3"');

            clearAndType(input, '1');
            $scope.$digest();

            const tooltip = document.body.querySelector('[uib-tooltip-popup]');
            expect(tooltip).not.toBeNull();
            expect(tooltip.textContent).toContain('3');
        });

        it('should render multiplicity tooltip in body when keyboard input not multiple of step', () => {
            $scope.exampleValue = 5;
            const input = compileInBody('data-step="5" data-max="1000" data-min="0"');

            clearAndType(input, '12');
            $scope.$digest();

            const tooltip = document.body.querySelector('[uib-tooltip-popup]');
            expect(tooltip).not.toBeNull();
            expect(tooltip.textContent).toContain('5');
        });

        it('should not render tooltip in body when keyboard input is valid', () => {
            $scope.exampleValue = 5;
            const input = compileInBody('data-step="1" data-max="1000" data-min="0"');

            clearAndType(input, '7');
            $scope.$digest();

            const tooltip = document.body.querySelector('[uib-tooltip-popup]');
            expect(tooltip).toBeNull();
        });
    });

    it('should revalidate, when change step, max or min in onlyValidation mode', () => {
        $scope.exampleValue = 5;
        $scope.step = 1;
        $scope.min = 0;
        $scope.max = 10;
        const el = $compile(`<div data-spinbox
                            data-validation-text="validationTextTest"
                            data-need-comma="true"
                            data-only-validation="true"
                            data-value="exampleValue"
                            data-step="step"
                            data-max="max"
                            data-min="min"></div>`)($scope);

        $scope.$digest();
        const input = el[0].querySelector('input');

        expect(input.value).toEqual($scope.exampleValue.toString());

        $scope.exampleValue = 5.5;
        $scope.$digest();
        expect(input.classList.contains('ng-invalid')).toBeTruthy();
        expect(input.classList.contains('ng-invalid-spinbox-input')).toBeTruthy();

        $scope.step = 0.5;
        $scope.$digest();

        expect(input.classList.contains('ng-invalid')).toBeFalsy();
        expect(input.classList.contains('ng-invalid-spinbox-input')).toBeFalsy();
        expect(input.classList.contains('ng-valid')).toBeTruthy();
        expect(input.classList.contains('ng-valid-spinbox-input')).toBeTruthy();
        expect(input.classList.contains('ng-dirty')).toBeTruthy();

        $scope.min = 6;
        $scope.$digest();
        expect(input.classList.contains('ng-invalid')).toBeTruthy();
        expect(input.classList.contains('ng-invalid-spinbox-input')).toBeTruthy();
        expect(input.classList.contains('ng-valid')).toBeFalsy();
        expect(input.classList.contains('ng-valid-spinbox-input')).toBeFalsy();

        $scope.exampleValue = 9;
        $scope.$digest();

        $scope.max = 8;
        $scope.$digest();

        expect($scope.exampleValue).toBeUndefined();
        expect(input.value).toEqual('9');
        expect(input.classList.contains('ng-invalid')).toBeTruthy();
        expect(input.classList.contains('ng-invalid-spinbox-input')).toBeTruthy();
        expect(input.classList.contains('ng-valid')).toBeFalsy();
        expect(input.classList.contains('ng-valid-spinbox-input')).toBeFalsy();
    });
});
