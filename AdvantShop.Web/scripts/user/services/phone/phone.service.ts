import { IHttpService, type IPromise, translate } from 'angular';
import { IConfirmCodeParams, IInitCodeConfirmationResponse, ISendCodeParams, ISendCodeResponse } from './phone.types';
import { isResponseError, Response } from '../../../@types/http';

export interface IPhoneService {
    sendCode(params: ISendCodeParams): IPromise<ISendCodeResponse>;

    initCodeConfirmation(): IPromise<IInitCodeConfirmationResponse>;

    checkPhoneConfirmed(phone?: string): IPromise<boolean>;

    confirmCode(params: IConfirmCodeParams): IPromise<void>;
}

export default class PhoneService implements IPhoneService {
    /* @ngInject */
    constructor(
        readonly $http: IHttpService,
        readonly $translate: translate.ITranslateService,
    ) {
    }

    sendCode(params: ISendCodeParams) {
        return this.$http
            .post<Response<ISendCodeResponse>>('user/sendCode', params)
            .then((response) => {
                if (isResponseError(response.data)) {
                    if (response.data.errors != null && response.data.errors.length > 0) {
                        throw new Error(response.data.errors[0]);
                    } else {
                        throw new Error(this.$translate.instant('Js.ConfirmSms.ErrorSendSms'));
                    }
                }

                if (response.data.obj == null) {
                    throw new Error(this.$translate.instant('Js.ConfirmSms.ErrorSendSms'));
                }

                return response.data.obj;
            });
    };

    initCodeConfirmation() {
        return this.$http
            .get<Response<IInitCodeConfirmationResponse>>('user/initCodeConfirmation')
            .then((response) => {
                if (isResponseError(response.data)) {
                    throw new Error(response.data.errors.join(' '));
                }

                if (response.data.obj == null) {
                    throw new Error('System error while process of init code confirmation');
                }

                return response.data.obj;
            });
    };

    checkPhoneConfirmed(phone?: string) {
        return this.$http
            .post<Response<boolean>>('user/isPhoneConfirmed', { phone, rnd: Math.random() })
            .then((response) => {
                if (isResponseError(response.data)) {
                    throw new Error(response.data.errors.join(' '));
                }

                if (response.data.obj == null) {
                    throw new Error('System error while process of checking phone confirmation');
                }

                return response.data.obj;
            });
    };

    confirmCode(params: IConfirmCodeParams) {
        return this.$http
            .post<Response>('user/confirmCode', params)
            .then((response) => {
                if (isResponseError(response.data)) {
                    throw new Error(response.data.errors.join(' '));
                }
            });
    }
}
