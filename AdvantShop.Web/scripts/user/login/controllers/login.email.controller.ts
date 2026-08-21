import type { ILoginService } from '../login.service';
import type { IToasterService } from 'ngtoaster';
import type { IController, IPromise, IQService, ISCEService, IScope, IWindowService, translate } from 'angular';
import type { ILoginController, ILoginStatus } from './login.controller';
import type { EmailStatusType, PasswordType } from '../login.types';
import type { ICaptchaService } from '../../../_common/captcha/captcha.service';
import { Captcha } from '../../../_common/captcha/captcha.types';
import { IEmailService } from '../../services/email/email.service';
import { IOnSendCodeResponse } from '@/scripts/_common/code-input/codeInput.types';

export interface ILoginEmailController extends IController, ILoginStatus<EmailStatusType> {
    email?: string;
    password?: string;
    showRoutes: boolean;
    inputPassword: PasswordType;
    lpId?: number;
    isNeedRegistered?: boolean;
    emailWatcher?: () => void;

    sendEmail(): void;

    switchPasswordType(): void;

    login(): void;

    recoveryPassword(): void;

    sendCode(): IPromise<IOnSendCodeResponse>;

    confirmCode(code: string): void;
}

export default class LoginEmailController implements ILoginEmailController {
    email?: string;
    password?: string;
    status: EmailStatusType = 'email';
    showRoutes = true;
    inputPassword: PasswordType = 'password';
    redirectTo?: string;
    lpId?: number;
    parentCtrl?: ILoginController;
    isNeedRegistered?: boolean;
    emailWatcher?: () => void;

    /* @ngInject */
    constructor(
        readonly loginService: ILoginService,
        readonly toaster: IToasterService,
        readonly $window: IWindowService,
        readonly $scope: IScope,
        readonly $sce: ISCEService,
        readonly $translate: translate.ITranslateService,
        readonly captchaService: ICaptchaService,
        readonly emailService: IEmailService,
        readonly emailCodeLength: number,
        readonly $q: IQService,
    ) {}

    $onInit() {
        this.setLoaded(true);

        this.initEmail();
        this.setShowBack(false);
        this.setTitle(this.getTitle(this.status));
        this.setDescription(this.getDescription(this.status));
        this.changeShowRoutes(true);
        this.subscribeToBackButton();
        this.setLoaded(false);
    }

    $onDestroy() {
        if (this.emailWatcher != null) {
            this.emailWatcher();
        }
    }

    subscribeToBackButton() {
        this.$scope.$on('backLoginEmail', () => {
            this.changeStatus(this.getBackStatus(this.status));
        });
    }

    sendEmail() {
        if (this.email == null) {
            this.toaster.pop('success', '', this.$translate.instant('Js.Login.Email.EmailEmptyError'));
            return;
        }

        let captcha: Captcha | null = null;
        const email = this.email;

        this.captchaService
            .confirmIfExist('auth')
            .then((captchaResult) => {
                captcha = captchaResult;

                return this.loginService.authorizationData({
                    data: email,
                    captchaId: captcha?.captchaId,
                    inputValue: captcha?.inputValue,
                    captchaInstanceId: captcha?.instanceId,
                });
            })
            .then((authorizationStatus) => {
                this.isNeedRegistered = authorizationStatus[0] !== 'y';

                if (authorizationStatus[1] === 'c') {
                    this.changeStatus('confirmation');
                } else if (this.isNeedRegistered) {
                    this.changeStatus('registration');
                } else {
                    this.changeStatus('password');
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

    changeStatus(status: EmailStatusType) {
        this.setLoaded(true);
        const validStatuses: EmailStatusType[] = ['email', 'password', 'confirmation', 'registration', 'forgotPassword'];

        if (status !== null && validStatuses.includes(status)) {
            this.status = status;
            this.changeShowRoutes(status === 'email');
            this.setShowBack(status !== 'email');
            this.setTitle(this.getTitle(this.status));
            this.setDescription(this.getDescription(this.status));
            this.setLoaded(false);
        } else {
            this.toaster.pop('error', '', this.$translate.instant('Js.Login.Email.ReturnError'));
            this.setLoaded(false);
        }
    }

    switchPasswordType() {
        this.inputPassword = this.inputPassword === 'password' ? 'text' : 'password';
    }

    login() {
        if (typeof this.email === 'undefined' || this.email === null) {
            this.toaster.pop('success', '', this.$translate.instant('Js.Login.Email.EmailEmptyError'));
            return;
        }

        if (typeof this.password === 'undefined' || this.password === null) {
            this.toaster.pop('success', '', this.$translate.instant('Js.Login.Email.PasswordEmptyError'));
            return;
        }

        let captcha: Captcha | null = null;
        const email = this.email;
        const password = this.password;

        this.captchaService
            .confirmIfExist('auth')
            .then((captchaResult) => {
                captcha = captchaResult;

                return this.loginService.emailLogin({
                    email,
                    password,
                    captchaId: captcha?.captchaId,
                    inputValue: captcha?.inputValue,
                    captchaInstanceId: captcha?.instanceId,
                });
            })
            .then((twoFactorRedirect) => {
                if (twoFactorRedirect !== null && twoFactorRedirect !== '') {
                    this.$window.location.assign(twoFactorRedirect);
                } else if (typeof this.redirectTo !== 'undefined' && this.redirectTo !== null) {
                    this.$window.location.assign(this.redirectTo);
                } else {
                    this.$window.location.reload();
                }
            })
            .catch((error) => {
                this.toaster.pop('error', '', error.message);
                this.password = undefined;
            })
            .finally(() => {
                if (captcha !== null) {
                    captcha.close();
                }
            });
    }

    recoveryPassword() {
        if (typeof this.email === 'undefined' || this.email === null) {
            this.toaster.pop('success', '', this.$translate.instant('Js.Login.Email.EmailEmptyError'));
            return;
        }

        this.loginService
            .recoveryPassword(this.email, this.lpId)
            .then(() => {
                this.changeStatus('forgotPassword');
            })
            .catch((error) => {
                this.toaster.pop('error', '', error.message);
            });
    }

    getTitle(status: EmailStatusType) {
        switch (status) {
            case 'email':
                return this.$translate.instant('Js.Login.Email.EmailTitle');
            case 'password':
                return this.$translate.instant('Js.Login.Email.PasswordTitle');
            case 'registration':
                return this.$translate.instant('Js.Login.Email.RegistrationTitle');
            case 'forgotPassword':
                return this.$translate.instant('Js.Login.Email.ForgotPasswordTitle');
            case 'confirmation':
                return this.$translate.instant('Js.Login.Email.ConfirmationTitle');
            default: {
                const exhaustiveCheck: never = status;
                throw new Error(`Unexpected status ${exhaustiveCheck}`);
            }
        }
    }

    getDescription(status: EmailStatusType) {
        switch (status) {
            case 'email':
                return this.$translate.instant('Js.Login.Email.EmailDescription');
            case 'password':
                return this.$translate.instant('Js.Login.Email.PasswordDescription');
            case 'registration':
                return this.$translate.instant('Js.Login.Email.RegistrationDescription');
            case 'forgotPassword':
                return this.$translate.instant('Js.Login.Email.ForgotPasswordDescription');
            case 'confirmation':
                return this.$translate.instant('Js.Login.Email.ConfirmationDescription', {
                    email: this.email,
                });
            default: {
                const exhaustiveCheck: never = status;
                throw new Error(`Unexpected status ${exhaustiveCheck}`);
            }
        }
    }

    getBackStatus(status: EmailStatusType): EmailStatusType {
        switch (status) {
            case 'password':
            case 'confirmation':
            case 'registration':
                return 'email';
            case 'forgotPassword':
                return 'password';
            case 'email':
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
            if (this.parentCtrl.renderFrom === 'checkout') {
                this.parentCtrl.showBack = false;
                return;
            }

            this.parentCtrl.showBack = showBack;
        }
    }

    changeShowRoutes(show: boolean) {
        if (typeof this.parentCtrl !== 'undefined' && this.parentCtrl !== null) {
            this.parentCtrl.showAuthMethods = show;
        }
    }

    sendCode() {
        if (typeof this.email === 'undefined' || this.email === null) {
            return this.$q.resolve({ success: false });
        }

        const email = this.email;
        let captcha: Captcha | null = null;

        return this.captchaService
            .confirmIfExist('auth')
            .then((captchaResult) => {
                captcha = captchaResult;

                return this.emailService.sendCode({
                    email,
                    authorize: this.isNeedRegistered !== true,
                    captchaId: captcha?.captchaId,
                    inputValue: captcha?.inputValue,
                    captchaInstanceId: captcha?.instanceId,
                });
            })
            .then(() => {
                this.toaster.pop('success', '', this.$translate.instant('Js.Login.Email.SendCode.Success'));

                return { success: true };
            })
            .catch(() => {
                this.toaster.pop('error', '', this.$translate.instant('Js.Login.Email.SendCode.Error'));

                return { success: false };
            })
            .finally(() => {
                if (captcha != null) {
                    captcha.close();
                }
            });
    }

    confirmCode(code: string) {
        if (typeof this.email === 'undefined' || this.email === null || typeof code === 'undefined' || code === null) {
            return;
        }

        let captcha: Captcha | null = null;
        const email = this.email;

        this.captchaService
            .confirmIfExist('auth')
            .then((captchaResult) => {
                captcha = captchaResult;

                return this.emailService.confirmCode({
                    email,
                    code,
                    authorize: this.isNeedRegistered !== true,
                    captchaId: captcha?.captchaId,
                    inputValue: captcha?.inputValue,
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

    private initEmail() {
        if (this.parentCtrl != null) {
            this.email = this.parentCtrl.email;
        }

        this.emailWatcher = this.$scope.$watch('$ctrl.email', (newValue, _oldValue) => {
            if (this.parentCtrl != null && typeof newValue === 'string') {
                this.parentCtrl.email = newValue;
            }
        });
    }
}
