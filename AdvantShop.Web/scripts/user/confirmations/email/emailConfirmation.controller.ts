import { IController, IPromise, IQService, type IScope, translate } from 'angular';
import { IEmailConfirmationScope } from './emailConfirmation.directive';
import { IEmailConfirmationConfig } from './emailConfirmation.config';
import { Captcha } from '../../../_common/captcha/captcha.types';
import { IToasterService } from 'ngtoaster';
import { ICaptchaService } from '../../../_common/captcha/captcha.service';
import { IEmailService } from '../../services/email/email.service';
import { IOnSendCodeResponse } from '../../../_common/code-input/codeInput.types';

export interface IEmailConfirmationController extends IController, IEmailConfirmationScope {
    confirmedEmail?: string;
    emailDispatch?: () => void;

    sendCode(): IPromise<IOnSendCodeResponse>;

    confirmCode(code: string): void;
}

export default class EmailConfirmationController implements IEmailConfirmationController {
    email?: string;
    showConfirmation?: boolean;
    confirmed = false;
    confirmedEmail?: string;
    emailDispatch?: () => void;

    /* @ngInject */
    constructor(
        readonly $scope: IScope,
        readonly emailConfirmationConfig: IEmailConfirmationConfig,
        readonly toaster: IToasterService,
        readonly $translate: translate.ITranslateService,
        readonly captchaService: ICaptchaService,
        readonly emailService: IEmailService,
        readonly emailCodeLength: number,
        readonly $q: IQService,
    ) {
    }

    $onInit() {
        this.emailDispatch = this.$scope.$watch('$ctrl.email', (newValue, _oldValue) => {
            this.confirmed =
                this.confirmedEmail != null
                && this.confirmedEmail !== ''
                && this.confirmedEmail === newValue;
        });
    };

    $onDestroy() {
        if (typeof this.emailDispatch !== 'undefined' && this.emailDispatch !== null) {
            this.emailDispatch();
        }
    };

    sendCode() {
        if (this.email == null || this.email === '' || this.email.length === 0) {
            this.toaster.pop(
                'error',
                '',
                'Укажите корректный email',
            );
            return this.$q.resolve({ success: false });
        }

        const email = this.email;
        let captcha: Captcha | null = null;

        return this.captchaService
            .confirmIfExist('auth')
            .then((captchaResult) => {
                captcha = captchaResult;

                return this.emailService
                    .sendCode({
                        email,
                        authorize: false,
                        captchaId: captcha?.captchaId,
                        inputValue: captcha?.inputValue,
                        captchaInstanceId: captcha?.instanceId,
                    });
            })
            .then(() => {
                this.toaster.pop(
                    'success',
                    '',
                    this.$translate.instant('Js.Login.Email.SendCode.Success'),
                );

                return { success: true };
            })
            .catch(() => {
                this.toaster.pop(
                    'error',
                    '',
                    this.$translate.instant('Js.Login.Email.SendCode.Error'),
                );

                return { success: false };
            })
            .finally(() => {
                if (captcha != null) {
                    captcha.close();
                }
            });
    };

    confirmCode(code: string) {
        if (typeof this.email === 'undefined' || this.email === null
            || typeof code === 'undefined' || code === null) {
            return;
        }

        let captcha: Captcha | null = null;
        const email = this.email;

        this.captchaService
            .confirmIfExist('auth')
            .then((captchaResult) => {
                captcha = captchaResult;

                return this.emailService
                    .confirmCode({
                        email,
                        code,
                        authorize: false,
                        captchaId: captcha?.captchaId,
                        inputValue: captcha?.inputValue,
                        captchaInstanceId: captcha?.instanceId,
                    });
            })
            .then(() => {
                this.confirmed = true;
                this.confirmedEmail = this.email;
            })
            .catch((error) => {
                this.toaster.pop('error', '', error.message);
            })
            .finally(() => {
                if (captcha !== null) {
                    captcha.close();
                }
            });
    };
}
