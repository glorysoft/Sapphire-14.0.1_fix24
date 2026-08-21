export interface Captcha {
    inputValue: string;
    captchaId: string;
    instanceId: string;
    close: () => void;
}

export type ICaptchaType = 'sendCode' | 'auth';

export interface IBaseCaptchaParams {
    captchaId?: string;
    inputValue?: string;
    captchaInstanceId?: string;
}
