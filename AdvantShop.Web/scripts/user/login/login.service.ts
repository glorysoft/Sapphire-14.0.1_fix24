import type { IHttpService, IPromise, IQService, ITimeoutService, translate } from 'angular';
import { isResponseError, type Response } from '../../@types/http';
import {
    AuthorizationType,
    IAuthorizationDataParams,
    IAuthRoute,
    IEmailLoginParams,
    ILoginCodeSettings,
    MethodType,
} from './login.types';

export interface ILoginService {
    internalError: string;

    getDefaultMethod(): IPromise<MethodType>;

    getDefaultAuthModuleId(): IPromise<string>;

    getAuthRoutes(): IPromise<IAuthRoute[]>;

    emailLogin(params: IEmailLoginParams): IPromise<string>;

    recoveryPassword(email: string, lpId?: number): IPromise<void>;

    getLoginCodeSettings(): IPromise<ILoginCodeSettings>;

    authorizationData(params: IAuthorizationDataParams): IPromise<AuthorizationType>;
}

export default class LoginService implements ILoginService {
    internalError: string;

    /* @ngInject */
    constructor(
        readonly $http: IHttpService,
        readonly $translate: translate.ITranslateService,
        readonly $timeout: ITimeoutService,
        readonly $q: IQService,
    ) {
        this.internalError = this.$translate.instant('Js.Login.Service.InternalError');
    };

    getDefaultMethod() {
        return this.$http
            .get<Response<MethodType>>('user/getAuthMethod')
            .then((response) => {
                if (response.status === 200
                    && !isResponseError(response.data)
                    && typeof response.data.obj !== 'undefined'
                    && response.data.obj !== null) {
                    return response.data.obj;
                }

                throw new Error(this.$translate.instant('Js.Login.Service.DefaultMethodError'));
            });
    };

    getDefaultAuthModuleId() {
        return this.$http
            .get<Response<string>>('user/getAuthModuleId')
            .then((response) => {
                if (response.status === 200
                    && !isResponseError(response.data)
                    && typeof response.data.obj !== 'undefined'
                    && response.data.obj !== null) {
                    return response.data.obj;
                }

                throw new Error(this.$translate.instant('Js.Login.Service.DefaultAuthModuleError'));
            });
    };

    getAuthRoutes() {
        return this.$http
            .get<Response<IAuthRoute[]>>('user/getAuthRoutes')
            .then((response) => {
                if (response.status === 200
                    && !isResponseError(response.data)
                    && typeof response.data.obj !== 'undefined'
                    && response.data.obj !== null) {
                    return response.data.obj;
                }

                throw new Error(this.$translate.instant('Js.Login.Service.AuthRoutesError'));
            });
    };

    emailLogin(params: IEmailLoginParams) {
        return this.$http
            .post<Response<string>>('user/emailLogin', params)
            .then((response) => {
                if (response.status === 200
                    && !isResponseError(response.data)
                    && typeof response.data.obj !== 'undefined'
                    && response.data.obj !== null) {
                    return response.data.obj;
                }

                throw new Error(this.$translate.instant('Js.Login.Service.EmailLoginError'));
            });
    };

    recoveryPassword(email: string, lpId?: number) {
        return this.$http
            .post<Response>('user/sendRecoveryPassword', { email, lpId })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error(this.internalError);
                }

                if (isResponseError(response.data)) {
                    throw new Error(response.data.errors.join(' '));
                }
            });
    };

    getLoginCodeSettings() {
        return this.$http
            .get<Response<ILoginCodeSettings>>('user/getLoginCodeSettings')
            .then((response) => {
                if (response.status === 200
                    && !isResponseError(response.data)
                    && typeof response.data.obj !== 'undefined'
                    && response.data.obj !== null) {
                    return response.data.obj;
                }

                throw new Error(this.$translate.instant('Js.Login.Service.LoginCodeSettingsError'));
            });
    };


    authorizationData(params: IAuthorizationDataParams) {
        return this.$http
            .post<Response<AuthorizationType>>('user/authorizationData', params)
            .then((response) => {
                if (!isResponseError(response.data)) {
                    if (typeof response.data.obj !== 'undefined' && response.data.obj !== null) {
                        return response.data.obj;
                    }

                    throw new Error(this.internalError);
                }

                throw new Error(response.data.errors.join(' '));
            });
    }
}
