import { describe, it, vi, expect, beforeEach } from 'vitest';
import { ITemplateCacheService } from 'angular';
import codeInputModule from './codeInput';
import '../../../node_modules/angular-translate/dist/angular-translate.js';
import '../../../node_modules/angular-sanitize/angular-sanitize.js';
import { createTestApp } from '@/tests/mocks/angularjs-mocks';

import templateUrl from './codeInput.template.html';
import templateContent from './codeInput.template.html?raw';

const onCompleteFillingMock = vi.fn();
const onSendCodeMock = vi.fn();

describe('codeInput', () => {
    beforeEach(() => {
        onCompleteFillingMock.mockClear();
        onSendCodeMock.mockClear();
    });

    const getTestApp = () => {
        const app = createTestApp(['pascalprecht.translate', 'ngSanitize', codeInputModule]);
        const $templateCache = app.$injector.get<ITemplateCacheService>('$templateCache');
        $templateCache.put(templateUrl, templateContent);
        return app;
    };

    it('should call onCompleteFilling with code when all inputs are filled', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { scope, element } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input');

        ['1', '2', '3', '4'].forEach((digit, index) => {
            const input = inputs[index] as HTMLInputElement;
            input.value = digit;
            angular.element(input).triggerHandler('input');
            angular.element(input).triggerHandler('change');
        });

        $timeout.flush();
        scope.$digest();

        expect(onCompleteFillingMock).toHaveBeenCalledWith('1234');
    });

    it('should call onCompleteFilling once on iOS when inputs are filled sequentially', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { scope, element } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input');

        ['1', '2', '3', '4'].forEach((digit, index) => {
            const input = inputs[index] as HTMLInputElement;
            input.value = digit;
            angular.element(input).triggerHandler('input');
            angular.element(input).triggerHandler('change');
        });

        $timeout.flush();
        scope.$digest();

        expect(onCompleteFillingMock).toHaveBeenCalledTimes(4);
    });

    it('should set focus on first input when focusOnStart is true', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-focus-on-start="true">
            </code-input>
        `);

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[0], 'select');

        $timeout.flush();
        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
    });

    it('should not set focus when focusOnStart is false', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-focus-on-start="false">
            </code-input>
        `);

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpies = Array.from(inputs).map(input => vi.spyOn(input, 'select'));

        $timeout.flush();
        scope.$digest();

        selectSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());
    });

    it('should move focus to next input after entering a digit', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4">
            </code-input>
        `);

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[1], 'select');

        inputs[0].value = '1';
        angular.element(inputs[0]).triggerHandler('input');
        angular.element(inputs[0]).triggerHandler('change');

        $timeout.flush();
        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
    });

    it('should move focus to previous input on ArrowLeft', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4">
            </code-input>
        `);

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[0], 'select');

        angular.element(inputs[1]).triggerHandler({ type: 'keydown', key: 'ArrowLeft' } as JQueryEventObject);

        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
    });

    it('should move focus to next input on ArrowRight', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4">
            </code-input>
        `);

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[1], 'select');

        angular.element(inputs[0]).triggerHandler({ type: 'keydown', key: 'ArrowRight' } as JQueryEventObject);

        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
    });

    it('should not move focus beyond first input on ArrowLeft', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4">
            </code-input>
        `);

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[0], 'select');

        angular.element(inputs[0]).triggerHandler({ type: 'keydown', key: 'ArrowLeft' } as JQueryEventObject);

        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
    });

    it('should not move focus beyond last input on ArrowRight', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4">
            </code-input>
        `);

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[3], 'select');

        angular.element(inputs[3]).triggerHandler({ type: 'keydown', key: 'ArrowRight' } as JQueryEventObject);

        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
    });

    it('should move focus to previous input on Backspace when current is empty', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4">
            </code-input>
        `);

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        inputs[0].value = '1';
        angular.element(inputs[0]).triggerHandler('input');
        angular.element(inputs[0]).triggerHandler('change');

        $timeout.flush();
        scope.$digest();

        const selectSpy = vi.spyOn(inputs[0], 'select');

        angular.element(inputs[1]).triggerHandler({ type: 'keydown', key: 'Backspace' } as JQueryEventObject);

        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
    });

    it('should set focus correctly after pasting full code', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[3], 'select');

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
        });
        pasteEvent.clipboardData?.setData('text/plain', '1234');

        element[0].dispatchEvent(pasteEvent);

        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
        expect(onCompleteFillingMock).toHaveBeenCalledWith('1234');
    });

    it('should set focus correctly after pasting partial code', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[2], 'select');

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
        });
        pasteEvent.clipboardData?.setData('text/plain', '12');

        element[0].dispatchEvent(pasteEvent);

        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
        expect(onCompleteFillingMock).not.toHaveBeenCalled();
    });


    it('should call onSendCode when button is clicked', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');
        const $interval = $injector.get('$interval');
        const $q = $injector.get('$q');

        onSendCodeMock.mockReturnValue($q.resolve({ success: true }));

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-require-send-code="true"
                        data-on-send-code="onSendCode()">
            </code-input>
        `, { onSendCode: onSendCodeMock });

        $timeout.flush();
        scope.$digest();

        const button = element[0].querySelector('button.code-input__button') as HTMLButtonElement;
        expect(button).not.toBeNull();

        angular.element(button).triggerHandler('click');
        scope.$digest();

        expect(onSendCodeMock).toHaveBeenCalledTimes(1);

        const buttonAfterClick = element[0].querySelector('button.code-input__button');
        expect(buttonAfterClick).toBeNull();

        $interval.flush(1000);
    });

    it('should call onSendCode on retry when timer is 0', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');
        const $interval = $injector.get('$interval');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-require-send-code="false"
                        data-send-code-delay="1"
                        data-on-send-code="onSendCode()">
            </code-input>
        `, { onSendCode: onSendCodeMock });

        $timeout.flush();
        $interval.flush(2000);
        scope.$digest();

        const retryLink = element[0].querySelector('a.code-input__resend') as HTMLAnchorElement;
        expect(retryLink).not.toBeNull();

        angular.element(retryLink).triggerHandler('click');
        scope.$digest();

        expect(onSendCodeMock).toHaveBeenCalledTimes(1);

        $interval.flush(1000);
    });

    it('should not show retry link when timer is not 0', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');
        const $interval = $injector.get('$interval');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-require-send-code="false"
                        data-send-code-delay="10"
                        data-on-send-code="onSendCode()">
            </code-input>
        `, { onSendCode: onSendCodeMock });

        $timeout.flush();
        scope.$digest();

        const retryLink = element[0].querySelector('a.code-input__resend');
        expect(retryLink).toBeNull();

        const timerElement = element[0].querySelector('.code-input__timer');
        expect(timerElement).not.toBeNull();

        $interval.flush(10000);
    });

    it('should show timer after button click', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');
        const $interval = $injector.get('$interval');
        const $q = $injector.get('$q');

        onSendCodeMock.mockReturnValue($q.resolve({ success: true }));

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-require-send-code="true"
                        data-send-code-delay="5"
                        data-on-send-code="onSendCode()">
            </code-input>
        `, { onSendCode: onSendCodeMock });

        $timeout.flush();
        scope.$digest();

        const button = element[0].querySelector('button.code-input__button') as HTMLButtonElement;
        angular.element(button).triggerHandler('click');
        scope.$digest();

        const timerElement = element[0].querySelector('.code-input__timer');
        expect(timerElement).not.toBeNull();

        $interval.flush(5000);
        scope.$digest();

        const retryLink = element[0].querySelector('a.code-input__resend');
        expect(retryLink).not.toBeNull();
    });

    it('should show timer after retry and hide when finished', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');
        const $interval = $injector.get('$interval');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-require-send-code="false"
                        data-send-code-delay="2"
                        data-on-send-code="onSendCode()">
            </code-input>
        `, { onSendCode: onSendCodeMock });

        $timeout.flush();
        $interval.flush(3000);
        scope.$digest();

        const retryLink = element[0].querySelector('a.code-input__resend') as HTMLAnchorElement;
        angular.element(retryLink).triggerHandler('click');
        scope.$digest();

        const timerElement = element[0].querySelector('.code-input__timer');
        expect(timerElement).not.toBeNull();

        $interval.flush(3000);
        scope.$digest();

        const retryLinkAfter = element[0].querySelector('a.code-input__resend');
        expect(retryLinkAfter).not.toBeNull();
    });

    it('should filter out non-digit characters on input', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input');
        const firstInput = inputs[0] as HTMLInputElement;

        firstInput.value = 'abc!@#';
        angular.element(firstInput).triggerHandler('input');
        angular.element(firstInput).triggerHandler('change');

        scope.$digest();
        $timeout.flush();
        scope.$digest();

        expect(onCompleteFillingMock).not.toHaveBeenCalled();
    });

    it('should handle multiple digits in one input as paste', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[3], 'select');

        inputs[0].value = '1234';
        angular.element(inputs[0]).triggerHandler('input');
        angular.element(inputs[0]).triggerHandler('change');

        $timeout.flush();
        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
        expect(onCompleteFillingMock).toHaveBeenCalledWith('1234');
    });

    it('should filter non-digit characters when pasting', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const selectSpy = vi.spyOn(inputs[3], 'select');

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
        });
        pasteEvent.clipboardData?.setData('text/plain', '1a2b3c4d');

        element[0].dispatchEvent(pasteEvent);

        $timeout.flush();
        scope.$digest();

        expect(selectSpy).toHaveBeenCalled();
        expect(onCompleteFillingMock).toHaveBeenCalledWith('1234');
    });

    it('should handle paste with code longer than needed', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
        });
        pasteEvent.clipboardData?.setData('text/plain', '123456');

        element[0].dispatchEvent(pasteEvent);

        $timeout.flush();
        scope.$digest();

        expect(onCompleteFillingMock).toHaveBeenCalledWith('1234');
    });

    it('should fill remaining inputs when pasting from middle position', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        inputs[0].value = '1';
        angular.element(inputs[0]).triggerHandler('input');
        angular.element(inputs[0]).triggerHandler('change');
        $timeout.flush();

        inputs[1].value = '2';
        angular.element(inputs[1]).triggerHandler('input');
        angular.element(inputs[1]).triggerHandler('change');
        $timeout.flush();

        inputs[2].value = '34';
        angular.element(inputs[2]).triggerHandler('input');
        angular.element(inputs[2]).triggerHandler('change');

        $timeout.flush();
        scope.$digest();

        expect(onCompleteFillingMock).toHaveBeenCalledWith('1234');
    });

    it('should handle empty paste', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
        });
        pasteEvent.clipboardData?.setData('text/plain', '');

        element[0].dispatchEvent(pasteEvent);

        $timeout.flush();
        scope.$digest();

        expect(onCompleteFillingMock).not.toHaveBeenCalled();
    });


    it('should clear input on Delete and not complete when one is missing', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        ['1', '2', '3', '4'].forEach((digit, index) => {
            inputs[index].value = digit;
            angular.element(inputs[index]).triggerHandler('input');
            angular.element(inputs[index]).triggerHandler('change');
        });
        $timeout.flush();
        scope.$digest();

        onCompleteFillingMock.mockClear();

        angular.element(inputs[0]).triggerHandler({ type: 'keydown', key: 'Delete' } as JQueryEventObject);
        scope.$digest();

        inputs[3].value = '4';
        angular.element(inputs[3]).triggerHandler('input');
        angular.element(inputs[3]).triggerHandler('change');
        $timeout.flush();
        scope.$digest();

        expect(onCompleteFillingMock).not.toHaveBeenCalled();
    });

    it('should clear input on Backspace when it is filled', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        ['1', '2', '3', '4'].forEach((digit, index) => {
            inputs[index].value = digit;
            angular.element(inputs[index]).triggerHandler('input');
            angular.element(inputs[index]).triggerHandler('change');
        });
        $timeout.flush();
        scope.$digest();

        onCompleteFillingMock.mockClear();

        angular.element(inputs[1]).triggerHandler({ type: 'keydown', key: 'Backspace' } as JQueryEventObject);
        scope.$digest();

        inputs[3].value = '4';
        angular.element(inputs[3]).triggerHandler('input');
        angular.element(inputs[3]).triggerHandler('change');
        $timeout.flush();
        scope.$digest();

        expect(onCompleteFillingMock).not.toHaveBeenCalled();
    });


    it('should not call onCompleteFilling when inputs are not fully filled', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element } = render(`
                <code-input data-length="4"
                            data-on-complete-filling="onCompleteFilling(code)">
                </code-input>
            `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input');

        ['1', '2'].forEach((digit, index) => {
            const input = inputs[index] as HTMLInputElement;
            input.value = digit;
            angular.element(input).triggerHandler('input');
            angular.element(input).triggerHandler('change');
        });

        $timeout.flush();

        expect(onCompleteFillingMock).not.toHaveBeenCalled();
    });

    it('should not call onCompleteFilling when one input has invalid value', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-on-complete-filling="onCompleteFilling(code)">
            </code-input>
        `, { onCompleteFilling: onCompleteFillingMock });

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        inputs[0].value = '1';
        angular.element(inputs[0]).triggerHandler('input');
        angular.element(inputs[0]).triggerHandler('change');
        $timeout.flush();

        inputs[1].value = '2';
        angular.element(inputs[1]).triggerHandler('input');
        angular.element(inputs[1]).triggerHandler('change');
        $timeout.flush();

        inputs[3].value = '4';
        angular.element(inputs[3]).triggerHandler('input');
        angular.element(inputs[3]).triggerHandler('change');
        $timeout.flush();
        scope.$digest();

        expect(onCompleteFillingMock).not.toHaveBeenCalled();
    });


    it('should render correct number of inputs based on length', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="6">
            </code-input>
        `);

        $timeout.flush();
        scope.$digest();

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        expect(inputs.length).toBe(6);
        inputs.forEach((input, _) => {
            expect(input.value).toBe('');
        });
    });

    it('should render inputs with empty values initially', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="5">
            </code-input>
        `);

        $timeout.flush();
        scope.$digest();

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        expect(inputs.length).toBe(5);

        const allEmpty = Array.from(inputs).every(input => input.value === '' || input.value == null);
        expect(allEmpty).toBe(true);
    });

    it('should disable all inputs when disabled is true', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4"
                        data-disabled="true">
            </code-input>
        `);

        $timeout.flush();
        scope.$digest();

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const allDisabled = Array.from(inputs).every(input => input.disabled);
        expect(allDisabled).toBe(true);
    });

    it('should use default length from config when not specified', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input>
            </code-input>
        `);

        $timeout.flush();
        scope.$digest();

        const inputs = element[0].querySelectorAll('input');
        expect(inputs.length).toBeGreaterThan(0);
    });

    it('should not change input value on non-action keys', () => {
        const { render, $injector } = getTestApp();
        const $timeout = $injector.get('$timeout');

        const { element, scope } = render(`
            <code-input data-length="4">
            </code-input>
        `);

        const inputs = element[0].querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        inputs[0].value = '1';
        angular.element(inputs[0]).triggerHandler('input');
        angular.element(inputs[0]).triggerHandler('change');
        $timeout.flush();
        scope.$digest();

        angular.element(inputs[0]).triggerHandler({ type: 'keydown', key: 'a' } as JQueryEventObject);
        scope.$digest();

        expect(inputs[0].value).toBe('1');
    });
});
