import { IAugmentedJQuery, IController, IIntervalService, IPromise, IScope, ITimeoutService, translate } from 'angular';
import { ICodeInputScope } from './codeInput.directive';
import { ICodeInputConfig } from './codeInput.config';
import { ICodeInputOnCompleteFillingProps, IOnSendCodeResponse } from './codeInput.types';

const actionKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'] as const;
type ActionKey = typeof actionKeys[number];
const keys = new Set<string>(actionKeys);
export const iosDelay = 50;
export const focusDelay = 25;


export interface ICodeInputController extends IController, ICodeInputScope {
    values: string[];
    minIndex: number;
    maxIndex: number;
    showButton: boolean;
    timer: number;
    timerHtml: string;
    focusOn: number;

    intervalPromise?: IPromise<number>;

    onKeydown(event: KeyboardEvent, index: number): void;

    onPaste(event: ClipboardEvent): void;

    onChange(index: number): void;

    onButtonClick(): void;

    onRetry(): void;
}

export default class CodeInputController implements ICodeInputController {
    length?: number;
    focusOnStart?: boolean;
    disabled?: boolean;
    requireSendCode?: boolean;
    description?: string;
    sendCodeDelay?: number;
    sendText?: string;
    resendText?: string;
    onCompleteFilling?: (props: ICodeInputOnCompleteFillingProps) => void;
    onSendCode?: () => IPromise<IOnSendCodeResponse>;

    intervalPromise?: IPromise<number>;

    values: string[] = [];
    minIndex = 0;
    maxIndex = 0;
    showButton = false;
    timer = 0;
    timerHtml = '';
    focusOn = -1;

    /* @ngInject */
    constructor(
        readonly codeInputConfig: ICodeInputConfig,
        readonly $element: IAugmentedJQuery,
        readonly $timeout: ITimeoutService,
        readonly $scope: IScope,
        readonly $interval: IIntervalService,
        readonly $translate: translate.ITranslateService,
    ) {
    }

    $onInit() {
        this.length ??= this.codeInputConfig.defaultCodeLength;
        this.focusOnStart ??= this.codeInputConfig.defaultFocusOnStart;
        this.disabled ??= this.codeInputConfig.defaultDisabled;
        this.sendText ??= this.codeInputConfig.defaultSendText;
        this.resendText ??= this.codeInputConfig.defaultResendText;
        this.showButton = (this.requireSendCode ??= this.codeInputConfig.defaultRequireSendCode)
            && this.onSendCode != null;

        this.values = new Array(this.length);
        this.maxIndex = this.length - 1;

        if (this.focusOnStart) {
            this.$timeout(() => this.moveFocusOn(this.minIndex));
        }

        if (!this.showButton) {
            this.setTimer();
        }
    };

    $onDestroy() {
        if (this.intervalPromise != null) {
            this.$interval.cancel(this.intervalPromise);
        }
    }

    $postLink() {
        const callback = (event: ClipboardEvent) => this.onPaste(event);
        this.$element[0].addEventListener('paste', callback);
        this.$element.on('$destroy', () => {
            this.$element[0].removeEventListener('paste', callback);
        });

        this.$timeout(() => {
            this.$element[0].querySelectorAll('input')
                .forEach(element => this.setInputListeners(element));
        });
    }

    onKeydown(event: KeyboardEvent, index: number) {
        const key = this.getEventKey(event);

        if (!this.isActionKey(key)) {
            return;
        }

        const actions: Record<ActionKey, () => void> = {
            'ArrowLeft': () => this.moveFocusOn(index - 1),
            'ArrowRight': () => this.moveFocusOn(index + 1),
            'Backspace': () => this.delete(event, index),
            'Delete': () => this.delete(event, index),
        };

        actions[key]();
    };

    onPaste(event: ClipboardEvent) {
        this.validateLength();

        if (event.clipboardData == null) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        const clipboardValue = this.normalizedText(event.clipboardData.getData('text/plain'));

        if (clipboardValue == null || clipboardValue === '') {
            return;
        }

        this.onPasteProcess(clipboardValue, 0);
    };

    onChange(index: number) {
        this.values[index] = this.normalizedText(this.values[index]);

        if (this.values[index] == null || this.values[index] === '') {
            return;
        }

        const oldValue = this.values[index];

        this.$timeout(() => {
            if (oldValue === this.values[index]) {
                if (this.values[index].length > 1) {
                    this.onPasteProcess(this.values[index], index);
                } else {
                    this.moveFocusOn(index + 1);
                    this.process();
                }
            }
        }, iosDelay);
    };

    onButtonClick() {
        this.validateOnButtonClick();

        this.onSendCode().then(response => {
            this.showButton = !response.success;

            if (response.success) {
                this.setTimer();
            }
        });
    }

    onRetry() {
        if (this.onSendCode != null && this.timer === 0) {
            this.onSendCode();
            this.setTimer();
        }
    }

    private delete(event: KeyboardEvent, index: number) {
        event.preventDefault();

        if (!this.isNumber(this.values[index]) && index > this.minIndex) {
            this.moveFocusOn(index - 1);
            this.values[index - 1] = '';
        } else {
            this.values[index] = '';
        }
    }

    //Unidentified - on mobile
    private getEventKey(event: KeyboardEvent): string {
        return event.key !== 'Unidentified'
            ? event.key
            : event.target instanceof HTMLInputElement ? event.target.value : '';
    };

    private setInputListeners(element: HTMLInputElement) {
        const onMouseDown = function (event: Event) {
            if (document.activeElement === element) {
                event.preventDefault();
                element.select();
            }
        };

        const onFocus = () => {
            element.select();
        };

        const onInput = () => {
            element.select();
        };

        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('focus', onFocus);
        element.addEventListener('input', onInput);

        const unbind = this.$scope.$on('$destroy', () => {
            element.removeEventListener('mousedown', onMouseDown);
            element.removeEventListener('focus', onFocus);
            element.removeEventListener('input', onInput);
            unbind();
        });
    }

    private process() {
        let valid = true;

        for (let i = 0; i < this.values.length; i++) {
            if (this.values[i] == null || this.values[i] === '' || !this.isNumber(this.values[i])) {
                valid = false;
                this.values[i] = '';
            }
        }

        if (!valid) {
            return;
        }

        if (this.onCompleteFilling != null) {
            this.onCompleteFilling({
                code: this.values.join('')
            });
        }
    };

    private isNumber(value: any): boolean {
        return /\d/u.test(value);
    }

    private clearValues() {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] = '';
        }

        this.moveFocusOn(0);
    }

    private normalizedText(text?: string) {
        if (text == null || text === '') {
            return '';
        }

        return text.replaceAll(/\D/gu, '');
    }

    private moveFocusOn(index: number) {
        let focusOn = index;

        if (index > this.maxIndex) {
            focusOn = this.maxIndex;
        } else if (index < this.minIndex) {
            focusOn = this.minIndex;
        }

        this.focusOn = focusOn;

        const element = this.$element[0].querySelectorAll('input')[focusOn];
        this.$timeout(() => element.select(), focusDelay);
    }

    private setTimer() {
        if (this.intervalPromise != null) {
            this.$interval.cancel(this.intervalPromise);
        }

        if (this.sendCodeDelay == null || this.sendCodeDelay <= 0) {
            this.timer = this.codeInputConfig.defaultSendCodeDelay;
        } else {
            this.timer = this.sendCodeDelay;
        }

        this.intervalPromise = this.$interval(
            () => {
                if (this.timer > 0) {

                    this.timerHtml = this.$translate.instant('Js.Login.Code.RetryPhoneCountdownText', {
                        sec: this.timer,
                    });

                    this.timer--;
                } else {
                    this.timerHtml = '';

                    if (this.intervalPromise != null) {
                        this.$interval.cancel(this.intervalPromise);
                    }
                }
            },
            1000,
            this.timer,
        );
    };

    private onPasteProcess(code: string, index: number): void {
        this.validateLength();

        if (code.length > this.length) {
            index = 0;
        }

        if (index === 0) {
            this.clearValues();
        }

        for (let i = 0; i < code.length && index < this.length; i++) {
            this.values[index] = code[i];
            index++;
        }

        this.moveFocusOn(index);
        this.process();
    }

    private validateOnButtonClick(): asserts this is { onSendCode: () => IPromise<IOnSendCodeResponse> } {
        if (this.onSendCode == null) {
            throw new Error('Code input: OnButtonClick function onSendCode was null or undefined');
        }
    }

    private validateLength(): asserts this is { length: number } {
        if (this.length == null) {
            throw new Error('Code input: Length is required');
        }
    }

    private isActionKey(key: string): key is ActionKey {
        return keys.has(key);
    }
}
