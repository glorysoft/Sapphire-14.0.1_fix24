import type { IHttpService, IPromise, IQService, ITimeoutService, translate } from 'angular';
import { isResponseError, type Response } from '../../@types/http';
import type { IInitRegistration, IRegistration, MethodType } from './registration.types';

export interface IRegistrationService {
    internalError: string;

    initRegistration(): IPromise<IInitRegistration>;

    initCaptcha(ngModel: string): IPromise<string>;

    checkCaptcha(): IPromise<void>;

    submitRegistration(model: IRegistration, method: MethodType): IPromise<void>;

    getCustomerFieldsHtml(): IPromise<string>;
}

export default class RegistrationService implements IRegistrationService {
    internalError: string;

    /* @ngInject */
    constructor(
        readonly $http: IHttpService,
        readonly $translate: translate.ITranslateService,
        readonly $timeout: ITimeoutService,
        readonly $q: IQService,
    ) {
        this.internalError = this.$translate.instant('Js.Login.Service.InternalError');
    }

    initRegistration() {
        return this.$http
            .get<Response<IInitRegistration>>('user/initRegistration', {})
            .then((response) => {
                if (response.status === 200
                    && !isResponseError(response.data)
                    && typeof response.data.obj !== 'undefined'
                    && response.data.obj !== null) {
                    return response.data.obj;
                }

                throw new Error(this.$translate.instant('Js.Login.Service.InitRegistrationError'));
            });
    };

    initCaptcha(ngModel: string) {
        return this.$http
            .post<string>('/commonExt/getCaptchaHtml', { ngModel })
            .then((response) => {
                if (response.status === 200) {
                    return response.data;
                }

                throw new Error(this.$translate.instant('Js.Login.Service.InitCaptchaError'));
            });
    };

    checkCaptcha() {

        if (typeof CaptchaSource !== 'undefined') {
            CaptchaSource.InputId = 'CaptchaCode';

            const input = CaptchaSource.GetInputElement();
            if (typeof input === 'undefined' || input === null) {
                return this.$q.resolve();
            }

            return this.$http
                .get<any>(`${CaptchaSource.ValidationUrl}&i=${input.value}`)
                .then((response) => {
                    this.$timeout(() => {
                        CaptchaSource.ReloadImage();
                    }, 1000);
                    CaptchaSource.GetInputElement().value = '';

                    if (response.status === 200 && response.data === true) {
                        return this.$q.resolve();
                    }

                    throw new Error(this.$translate.instant('Js.Captcha.Wrong'));
                });
        }

        return this.$q.resolve();
    };

    submitRegistration(model: IRegistration, method: MethodType) {
        return this.$http
            .post<Response>('user/registration', {
                model,
                method,
            })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error(this.internalError);
                }

                if (isResponseError(response.data)) {
                    throw new Error(response.data.errors.join(' '));
                }
            });
    };

    getCustomerFieldsHtml() {
        const ngModelName = '$ctrl.registration';
        const cssParamName = 'col-xs-12 form-field-name-wrap';
        const cssParamValue = 'col-xs-12 form-field-input-wrap';
        const checkFields = true;
        const ngVariableVisible = '$ctrl.registration.CustomerType';

        const url = '/user/registrationCustomerFields' +
            `?ngModelName=${ngModelName}` +
            `&cssParamName=${cssParamName}` +
            `&cssParamValue=${cssParamValue}` +
            `&checkFields=${checkFields}` +
            `&ngVariableVisible=${ngVariableVisible}`;

        return this.$http.get<string>(url)
            .then((response) => response.data);
    };
}
