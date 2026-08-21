import { IBaseCaptchaParams } from '../../../_common/captcha/captcha.types';

export interface ISendCodeResponse {
    secondsToRetry: number;
}

export interface IConfirmCodeParams extends IBaseCaptchaParams {
    phone: string;
    code: string;
    signUp: boolean;
}

export interface ISendCodeParams extends IBaseCaptchaParams {
    phone: string;
    signUp: boolean;
}

export interface IInitCodeConfirmationResponse {
    type: 'Call' | 'Sms';
    description: string;
}
