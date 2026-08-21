import type ILoginService from '../login.service';
import type { CodeStatusType, ILoginCodeSettings } from '../login.types';
import type { IToasterService } from 'ngtoaster';
import type { IController, IIntervalService, IPromise, IQService, ISCEService, IScope, IWindowService, translate } from 'angular';
import type { ILoginController, ILoginStatus } from './login.controller';
import type { ICaptchaService } from '../../../_common/captcha/captcha.service';
import { IPhoneService } from '../../services/phone/phone.service';
import { Captcha } from '../../../_common/captcha/captcha.types';
import { IOnSendCodeResponse } from '@/scripts/_common/code-input/codeInput.types';

export interface ILoginCodeController extends IController, ILoginStatus<CodeStatusType> {
    phone?: string;
    code?: string;
    enableRetry: boolean;
    countdownSeconds: number;
    isNeedRegistered?: boolean;
    phoneWatcher?: () => void;

    sendPhone(): void;

    sendCode(): IPromise<IOnSendCodeResponse>;

    setCountdown(seconds: number): void;

    confirmCode(code: string): void;
}

export default class LoginCodeController implements ILoginCodeController {
    phone?: string;
    code?: string;
    status: CodeStatusType = 'phone';
    settings?: ILoginCodeSettings;
    enableRetry = true;
    countdownSeconds = 0;
    isNeedRegistered?: boolean;
    redirectTo?: string;
    parentCtrl?: ILoginController = undefined;
    phoneWatcher?: () => void;

    /* @ngInject */
    constructor(
        readonly loginService: ILoginService,
        readonly toaster: IToasterService,
        readonly $translate: translate.ITranslateService,
        readonly $scope: IScope,
        readonly $interval: IIntervalService,
        readonly $window: IWindowService,
        readonly $sce: ISCEService,
        readonly captchaService: ICaptchaService,
        readonly phoneService: IPhoneService,
        readonly phoneCodeLength: number,
        readonly $q: IQService,
    ) {}

    $onInit() {
        this.setLoaded(true);

        this.initPhone();
        this.changeShowRoutes(true);
        this.setTitle(this.getTitle(this.status));
        this.setDescription(this.getDescription(this.status));
        this.setShowBack(false);
        this.subscribeToBackButton();

        this.loginService
            .getLoginCodeSettings()
            .then((settings) => (this.settings = settings))
            .finally(() => this.setLoaded(false));
    }

    $onDestroy() {
        if (this.phoneWatcher != null) {
            this.phoneWatcher();
        }
    }

    subscribeToBackButton() {
        this.$scope.$on('backLoginCode', () => {
            this.changeStatus(this.getBackStatus(this.status));
        });
    }

    changeStatus(status: CodeStatusType) {
        this.setLoaded(true);
        const validStatuses: CodeStatusType[] = ['phone', 'confirmation', 'registration'];

        if (status !== null && validStatuses.includes(status)) {
            this.status = status;
            this.changeShowRoutes(status === 'phone');
            this.setShowBack(status !== 'phone');
            this.setTitle(this.getTitle(this.status));
            this.setDescription(this.getDescription(this.status));
            this.setLoaded(false);
        } else {
            this.toaster.pop('error', '', this.$translate.instant('Js.Login.Code.ReturnError'));
            this.setLoaded(false);
        }
    }

    sendPhone() {
        if (typeof this.phone === 'undefined' || this.phone === null || this.phone === '' || this.phone.length === 0) {
            this.toaster.pop('error', '', this.$translate.instant('Js.Login.Code.ErrorEmptyPhone'));
            return;
        }

        if (!this.enableRetry) {
            this.toaster.pop(
                'error',
                '',
                this.$translate.instant('Js.Login.Code.RetryError', {
                    sec: this.countdownSeconds,
                }),
            );
            return;
        }

        const phone = this.phone;

        this.captchaService.confirmIfExist('sendCode').then((captcha) => {
            this.loginService
                .authorizationData({
                    data: phone,
                    inputValue: captcha?.inputValue,
                    captchaId: captcha?.captchaId,
                    captchaInstanceId: captcha?.instanceId,
                })
                .then((authorizationStatus) => {
                    this.isNeedRegistered = authorizationStatus[0] !== 'y';
                    this.setCountdown(30);
                    this.toaster.pop('info', '', this.$translate.instant('Js.Login.Code.CodeSent') + this.phone);
                    this.changeStatus('confirmation');
                })
                .catch((error) => {
                    this.toaster.pop('error', '', error.message);
                })
                .finally(() => {
                    if (captcha !== null) {
                        captcha.close();
                    }
                });
        });
    }

    sendCode() {
        if (typeof this.phone === 'undefined' || this.phone === null || this.phone === '' || this.phone.length === 0) {
            return this.$q.resolve({ success: false });
        }

        if (!this.enableRetry) {
            this.toaster.pop(
                'error',
                '',
                this.$translate.instant('Js.Login.Code.RetryError', {
                    sec: this.countdownSeconds,
                }),
            );
            return this.$q.resolve({ success: false });
        }

        const phone = this.phone;
        let captcha: Captcha | null = null;

        return this.captchaService
            .confirmIfExist('sendCode')
            .then((captchaResult) => {
                captcha = captchaResult;

                return this.phoneService.sendCode({
                    phone,
                    signUp: this.isNeedRegistered === true,
                    inputValue: captcha?.inputValue,
                    captchaId: captcha?.captchaId,
                    captchaInstanceId: captcha?.instanceId,
                });
            })
            .then((response) => {
                this.setCountdown(response.secondsToRetry);
                this.toaster.pop('info', '', this.$translate.instant('Js.Login.Code.CodeSent') + this.phone);
                this.changeStatus('confirmation');

                return { success: true };
            })
            .catch((error) => {
                this.toaster.pop('error', '', error.message);

                return { success: false };
            })
            .finally(() => {
                if (captcha !== null) {
                    captcha.close();
                }
            });
    }

    setCountdown(seconds: number) {
        this.enableRetry = false;
        this.countdownSeconds = seconds;

        this.$interval(
            () => {
                this.countdownSeconds--;

                if (this.countdownSeconds <= 0) {
                    this.enableRetry = true;
                }
            },
            1000,
            seconds,
        );
    }

    confirmCode(code: string) {
        this.code = code;

        if (typeof this.code === 'undefined' || this.code === null || this.code.length < this.phoneCodeLength) {
            return;
        }

        if (typeof this.phone === 'undefined' || this.phone === null) {
            return;
        }

        const phone = this.phone;
        let captcha: Captcha | null = null;

        this.captchaService
            .confirmIfExist('auth')
            .then((captchaResult) => {
                captcha = captchaResult;

                return this.phoneService.confirmCode({
                    phone,
                    code,
                    signUp: this.isNeedRegistered === true,
                    inputValue: captcha?.inputValue,
                    captchaId: captcha?.captchaId,
                    captchaInstanceId: captcha?.instanceId,
                });
            })
            .then(() => {
                if (this.isNeedRegistered) {
                    this.changeStatus('registration');
                } else if (typeof this.redirectTo !== 'undefined' && this.redirectTo !== null) {
                    this.$window.location.assign(this.redirectTo);
                } else {
                    this.$window.location.reload();
                }
            })
            .catch((error) => {
                this.toaster.pop('error', '', error.message);
            })
            .finally(() => {
                if (captcha !== null) {
                    captcha.close();
                }
            });
    }

    getTitle(status: CodeStatusType) {
        switch (status) {
            case 'phone':
                return this.$translate.instant('Js.Login.Code.PhoneTitle');
            case 'confirmation':
                return this.$translate.instant('Js.Login.Code.ConfirmationTitle');
            case 'registration':
                return this.$translate.instant('Js.Login.Code.RegistrationTitle');
            default: {
                const exhaustiveCheck: never = status;
                throw new Error(`Unexpected status ${exhaustiveCheck}`);
            }
        }
    }

    getDescription(status: CodeStatusType) {
        switch (status) {
            case 'phone':
                return this.$translate.instant('Js.Login.Code.PhoneDescription');
            case 'confirmation':
                return this.settings?.CodeDescription ?? undefined;
            case 'registration':
                return this.$translate.instant('Js.Login.Code.RegistrationDescription');
            default: {
                const exhaustiveCheck: never = status;
                throw new Error(`Unexpected status ${exhaustiveCheck}`);
            }
        }
    }

    getBackStatus(status: CodeStatusType): CodeStatusType {
        switch (status) {
            case 'confirmation':
                return 'phone';
            case 'registration':
                return 'phone';
            case 'phone':
                throw new Error('Unsupported status');
            default: {
                const exhaustiveCheck: never = status;
                throw new Error(`Unexpected status ${exhaustiveCheck}`);
            }
        }
    }

    setTitle(title: string) {
        if (typeof this.parentCtrl !== 'undefined' && this.parentCtrl !== null) {
            if (this.parentCtrl.renderFrom === 'checkout') {
                this.parentCtrl.title = '';
                return;
            }
            this.parentCtrl.title = title;
        }
    }

    setDescription(description: string | undefined) {
        if (typeof this.parentCtrl !== 'undefined' && this.parentCtrl !== null) {
            this.parentCtrl.description = description;
        }
    }

    setLoaded(loaded: boolean) {
        if (typeof this.parentCtrl !== 'undefined' && this.parentCtrl !== null) {
            this.parentCtrl.loaded = loaded;
        }
    }

    setShowBack(showBack: boolean) {
        if (typeof this.parentCtrl !== 'undefined' && this.parentCtrl !== null) {
            this.parentCtrl.showBack = showBack;
        }
    }

    changeShowRoutes(show: boolean) {
        if (typeof this.parentCtrl !== 'undefined' && this.parentCtrl !== null) {
            this.parentCtrl.showAuthMethods = show;
        }
    }

    private initPhone = () => {
        if (this.parentCtrl != null) {
            this.phone = this.parentCtrl.phone;
        }

        this.phoneWatcher = this.$scope.$watch('$ctrl.phone', (newValue, _oldValue) => {
            if (this.parentCtrl != null && typeof newValue === 'string') {
                this.parentCtrl.phone = newValue;
            }
        });
    };
}
