import { IHttpService, IPromise, translate } from 'angular';
import { isResponseError, Response } from '../../../@types/http';
import { IConfirmEmailCodeParams, ISendEmailCodeParams } from './email.types';

export interface IEmailService {
    sendCode(params: ISendEmailCodeParams): IPromise<void>;

    confirmCode(params: IConfirmEmailCodeParams): IPromise<void>;
}

export default class EmailService implements IEmailService {
    /* @ngInject */
    constructor(
        readonly $http: IHttpService,
        readonly $translate: translate.ITranslateService,
    ) {
    }

    sendCode(params: ISendEmailCodeParams) {
        return this.$http
            .post<Response>('user/sendEmailCode', params)
            .then((response) => {
                if (isResponseError(response.data)) {
                    throw new Error(
                        response.data.errors.length > 0
                            ? response.data.errors.join(' ')
                            : this.$translate.instant('Js.Login.Service.SendEmailCodeError'),
                    );
                }
            });
    };

    confirmCode(params: IConfirmEmailCodeParams) {
        return this.$http
            .post<Response>('user/confirmEmailCode', params)
            .then((response) => {
                if (isResponseError(response.data)) {
                    throw new Error(
                        response.data.errors.length > 0
                            ? response.data.errors.join(' ')
                            : this.$translate.instant('Js.Login.Service.ConfirmEmailCodeError'),
                    );
                }
            });
    };


}
