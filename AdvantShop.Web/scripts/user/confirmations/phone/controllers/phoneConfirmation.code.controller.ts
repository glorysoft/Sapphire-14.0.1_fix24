import { IController, IPromise, IQService, translate } from 'angular';
import { IPhoneConfirmationCodeScope } from '../phoneConfirmation.directives';
import { IToasterService } from 'ngtoaster';
import { ICaptchaService } from '../../../../_common/captcha/captcha.service';
import { Captcha } from '../../../../_common/captcha/captcha.types';
import { IPhoneService } from '../../../services/phone/phone.service';
import { IOnSendCodeResponse } from '../../../../_common/code-input/codeInput.types';

export interface IPhoneConfirmationCodeController extends IController, IPhoneConfirmationCodeScope {
    confirmedPhone?: string;
    codeDescription: string;
    countdownSeconds: number;
    isCodeSent: boolean;
    sendCodeText: string;
    isInitialized: boolean;

    sendCode(): IPromise<IOnSendCodeResponse>;

    confirmCode(code: string): void;
}

export default class PhoneConfirmationCodeController implements IPhoneConfirmationCodeController {
    phone?: string;
    confirmedPhone?: string;
    codeDescription = '';
    countdownSeconds = 30;
    isCodeSent = false;
    confirmed = false;
    sendCodeText = '';
    isInitialized = false;

    /* @ngInject */
    constructor(
        readonly toaster: IToasterService,
        readonly $translate: translate.ITranslateService,
        readonly captchaService: ICaptchaService,
        readonly phoneService: IPhoneService,
        readonly phoneCodeLength: number,
        readonly $q: IQService,
    ) {
    }

    $onInit() {
        this.init();
        this.checkPhoneConfirmed();
    }

    sendCode() {
        if (this.phone == null || this.phone === '' || this.phone.length === 0) {
            this.toaster.pop(
                'error',
                '',
                this.$translate.instant('Js.ConfirmSms.ErrorEmptyPhone'),
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
                    signUp: true,
                    inputValue: captcha?.inputValue,
                    captchaId: captcha?.captchaId,
                    captchaInstanceId: captcha?.instanceId,
                });
            })
            .then((response) => {
                this.toaster.pop(
                    'info',
                    '',
                    this.$translate.instant('Js.ConfirmSms.CodeSended') + this.phone,
                );

                this.isCodeSent = true;
                this.countdownSeconds = response.secondsToRetry;

                return { success: true };
            })
            .catch((error) => {
                this.toaster.pop('error', '', error.message);

                return { success: false };
            })
            .finally(() => {
                if (captcha != null) {
                    captcha.close();
                }
            });
    }

    confirmCode(code: string) {
        if (!this.isCodeSent) {
            this.toaster.pop('error', '', this.$translate.instant('Js.ConfirmSms.NoClickSendSmsCode'));
            return;
        }

        if (typeof code === 'undefined'
            || code === null
            || code.length < this.phoneCodeLength) {
            return;
        }

        if (typeof this.phone === 'undefined'
            || this.phone === null) {
            return;
        }

        let captcha: Captcha | null = null;
        const phone = this.phone;

        this.captchaService
            .confirmIfExist('auth')
            .then((c) => {
                captcha = c;

                return this.phoneService
                    .confirmCode({
                        phone,
                        code,
                        signUp: true,
                        inputValue: captcha?.inputValue,
                        captchaId: captcha?.captchaId,
                        captchaInstanceId: captcha?.instanceId,
                    })
            })
            .then(() => {
                this.confirmed = true;
                this.confirmedPhone = this.phone;
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

    private init() {
        this.phoneService.initCodeConfirmation()
            .then((response) => {
                switch (response.type) {
                    case 'Call':
                        this.sendCodeText = this.$translate.instant('Js.PhoneConfirmationCode.SendCodeText.Call');
                        break;
                    case 'Sms':
                        this.sendCodeText = this.$translate.instant('Js.PhoneConfirmationCode.SendCodeText.Sms');
                        break;
                    default:
                        throw new Error('Phone confirmation: failed to initialize code confirmation. Unsupported type.');
                }

                this.codeDescription = response.description;
            })
            .finally(() => {
                this.isInitialized = true;
            });
    }

    private checkPhoneConfirmed() {
        if (this.phone == null || this.phone === '' || this.phone.length === 0) {
            return;
        }

        this.phoneService.checkPhoneConfirmed(this.phone)
            .then((isConfirmed) => {
                if (isConfirmed) {
                    this.confirmed = isConfirmed;
                    this.confirmedPhone = this.phone;
                }
            });
    }
}
