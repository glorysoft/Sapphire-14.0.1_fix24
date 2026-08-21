import template from './codeInput.template.html';
import { type IAttributes, IDirectiveFactory, IScope } from 'angular';
import { ICodeInputController } from './codeInput.controller';
import { ICodeInputOnCompleteFillingProps } from '@/scripts/_common/code-input/codeInput.types';

export interface ICodeInputScope {
    length?: number;
    focusOnStart?: boolean;
    disabled?: boolean;
    requireSendCode?: boolean;
    description?: string;
    sendCodeDelay?: number;
    sendText?: string;
    resendText?: string;
    onCompleteFilling?: (props: ICodeInputOnCompleteFillingProps) => void;
    onSendCode?: () => void;
}

type ICodeInputDirective = IDirectiveFactory<IScope & ICodeInputScope, JQLite, IAttributes, ICodeInputController>

const codeInput: ICodeInputDirective = () => ({
    restrict: 'E',
    scope: {
        length: '<?',
        focusOnStart: '<?',
        disabled: '=?',
        requireSendCode: '<?',
        description: '=?',
        sendCodeDelay: '=?',
        sendText: '=?',
        resendText: '=?',
        onCompleteFilling: '&',
        onSendCode: '&',
    },
    bindToController: true,
    controller: 'CodeInputController',
    controllerAs: '$ctrl',
    templateUrl: template,
});

export default codeInput;
