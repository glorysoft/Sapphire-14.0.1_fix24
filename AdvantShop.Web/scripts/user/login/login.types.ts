import { IBaseCaptchaParams } from '../../_common/captcha/captcha.types';

export interface IAuthRoute {
    Method: string;
    Title: string;
    ModuleId: string | null;
    ModuleControllerName: string | null;
}

export interface ILoginCodeSettings {
    EnablePhoneMask: boolean;
    CodeDescription: string | null;
}

export type MethodType = 'email' | 'code' | 'module';

export type EmailStatusType = 'email' | 'password' | 'registration' | 'forgotPassword' | 'confirmation';

export type CodeStatusType = 'phone' | 'confirmation' | 'registration';

export type PasswordType = 'text' | 'password';

type AuthorizationExistCustomerType = 'y' | 'n';

type AuthorizationMethodType = 'c' | 'p';

export type AuthorizationType = `${AuthorizationExistCustomerType}${AuthorizationMethodType}`;


export interface IAuthorizationDataParams extends IBaseCaptchaParams {
    data: string;
}

export interface IEmailLoginParams extends IBaseCaptchaParams {
    email: string;
    password: string;
}
