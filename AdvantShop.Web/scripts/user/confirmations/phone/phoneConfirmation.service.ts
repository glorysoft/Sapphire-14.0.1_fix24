import type { IHttpService, IPromise, translate } from 'angular';
import { isResponseError, type Response } from '../../../@types/http';
import { IInitData } from './phoneConfirmation.types';

export interface IPhoneConfirmationService {
    init(): IPromise<IInitData>;
}

export default class PhoneConfirmationService implements IPhoneConfirmationService {
    /* @ngInject */
    constructor(
        readonly $http: IHttpService,
        readonly $translate: translate.ITranslateService,
    ) {
    }

    init() {
        return this.$http
            .get<Response<IInitData>>('user/initPhoneConfirmation')
            .then((response) => {
                if (response.status === 200
                    && !isResponseError(response.data)
                    && typeof response.data.obj !== 'undefined'
                    && response.data.obj !== null) {
                    return response.data.obj;
                }

                throw new Error(this.$translate.instant('Js.PhoneConfirmation.Service.InitError'));
            });
    };
}
