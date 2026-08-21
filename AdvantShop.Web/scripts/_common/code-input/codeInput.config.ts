export interface ICodeInputConfig {
    pattern: string,
    inputMode: string,
    defaultCodeLength: number,
    defaultFocusOnStart: boolean,
    defaultDisabled: boolean,
    defaultRequireSendCode: boolean,
    defaultSendCodeDelay: number,
    defaultSendText: string,
    defaultResendText: string,
}

const codeInputConfig = {
    pattern: '[0-9]*',
    inputMode: 'numeric',
    defaultCodeLength: 4,
    defaultFocusOnStart: false,
    defaultDisabled: false,
    defaultRequireSendCode: false,
    defaultSendCodeDelay: 30,
    defaultSendText: '',
    defaultResendText: '',
};

export default codeInputConfig;
