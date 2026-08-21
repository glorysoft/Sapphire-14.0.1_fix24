import { ModalService } from '../modal/services/modalService';
import { IHttpService, IPromise, IQService, ITimeoutService, translate } from 'angular';
import { IToasterService } from 'ngtoaster';
import { isResponseError, type Response } from '../../@types/http';
import { Captcha, ICaptchaType } from './captcha.types';

export interface ICaptchaService {
    confirm(): IPromise<Captcha | null>;

    confirmIfExist(type: ICaptchaType): IPromise<Captcha | null>;
}

export default class CaptchaService implements ICaptchaService {

    /* @ngInject */
    constructor(
        readonly modalService: ModalService,
        readonly $q: IQService,
        readonly toaster: IToasterService,
        readonly $http: IHttpService,
        readonly $timeout: ITimeoutService,
        readonly $translate: translate.ITranslateService,
    ) {
    }

    confirm = (): IPromise<Captcha | null> => {
        const defer = this.$q.defer<Captcha | null>();
        const rnd = Math.random();
        const modalId = `CaptchaModal${rnd}`;

        const inputName = `CaptchaCode_${rnd.toString().replace('.', '_')}`;
        const captchaId = `CaptchaSource_${rnd.toString().replace('.', '_')}`;

        this.getCaptcha('extensions.captcha', inputName, captchaId)
            .then(captcha => {
                this.modalService.renderModal(
                    modalId,
                    `{{ 'Js.CaptchaService.Confirm.Header' | translate }}`,
                    captcha,
                    `<a class="btn btn-submit btn-middle"
                        data-ng-click="extensions.submit(extensions.captcha)">
                        {{ 'Js.CaptchaService.Confirm.Confirm' | translate }}
                    </a>`,
                    {
                        isOpen: false,
                        modalClass: '',
                        backgroundEnable: true,
                        modalOverlayClass: '',
                        spyAddress: false,
                        anchor: modalId,
                        destroyOnClose: true,
                        id: '',
                        closeOut: true,
                        isFloating: false,
                        isShowFooter: true,
                        inIframe: false,
                        crossEnable: true,
                        closeEsc: false,
                    },
                    {
                        extensions: {
                            captcha: '',
                            submit: (value: string) => {
                                defer.resolve({
                                    captchaId,
                                    inputValue: value,
                                    instanceId: window[captchaId].InstanceId,
                                    close: () => {
                                        this.modalService.getModal(modalId).then((modal) => {
                                            modal.modalScope.destroy();
                                        });
                                    },
                                });
                            },
                        },
                    },
                );

                this.modalService.getModal(modalId).then((modal) => {
                    modal.modalScope.open(true);
                });
            });

        return defer.promise;
    };

    confirmIfExist = (type: ICaptchaType): IPromise<Captcha | null> => {
        const defer = this.$q.defer<Captcha | null>();

        switch (type) {
            case 'auth':
                this.isNeedShowAuthCaptcha().then((isNeed) => {
                    if (!isNeed) return defer.resolve(null);

                    this.confirm().then((captcha) => defer.resolve(captcha));
                });
                break;
            case 'sendCode':
                this.isNeedShowSendCodeCaptcha().then((isNeed) => {
                    if (!isNeed) return defer.resolve(null);

                    this.confirm().then((captcha) => defer.resolve(captcha));
                });
                break;
            default:
                defer.resolve(null);
        }

        return defer.promise;
    };

    private isNeedShowSendCodeCaptcha = () =>
        this.$http
            .get<Response<boolean>>('/user/isNeedShowSendCodeCaptcha')
            .then(response => {
                if (!isResponseError(response.data) && response.data.obj != null) {
                    return response.data.obj;
                }

                throw new Error(this.$translate.instant('Js.CaptchaService.SettingError'));
            });

    private isNeedShowAuthCaptcha = () =>
        this.$http
            .get<Response<boolean>>('/user/isNeedShowAuthCaptcha')
            .then(response => {
                if (!isResponseError(response.data) && response.data.obj != null) {
                    return response.data.obj;
                }

                throw new Error(this.$translate.instant('Js.CaptchaService.SettingError'));
            });


    private getCaptcha = (
        valueName?: string,
        captchaCode?: string,
        captchaId?: string
    ): IPromise<string> =>
        this.$http
            .post<string>('/commonExt/getCaptchaHtml', {
                ngModel: valueName,
                captchaCode,
                captchaId,
            })
            .then((response) => response.data);
}
