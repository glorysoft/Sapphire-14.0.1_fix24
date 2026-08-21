import { IBaseCaptchaParams } from '../../../_common/captcha/captcha.types';

export interface ISendEmailCodeParams extends IBaseCaptchaParams {
    email: string;
    authorize: boolean;
}

export interface IConfirmEmailCodeParams extends IBaseCaptchaParams {
    email: string;
    code: string;
    authorize: boolean;
}
