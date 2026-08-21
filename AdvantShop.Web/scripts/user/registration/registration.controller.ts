import type IRegistrationService from './registration.service';
import type { IToasterService } from 'ngtoaster';
import type { IController, ISCEService, IWindowService } from 'angular';
import type { IRegistration, IRegistrationSettings, MethodType } from './registration.types';
import type { ILoginController } from '@/scripts/user/login/controllers/login.controller';

export interface IRegistrationController extends IController {
    settings?: IRegistrationSettings;
    registration?: IRegistration;
    method?: MethodType;
    email?: string;
    phone?: string;
    partnersRegistrationUrl: string;
    captchaHtml?: string;
    redirectTo?: string;
    inputPassword: PasswordType;
    inputPasswordConfirm: PasswordType;
    customerFieldsHtml?: string;
    parentCtrl?: ILoginController;

    switchPasswordType(input: 'inputPassword' | 'inputPasswordConfirm'): void;

    buildPartnersRegistrationUrl(): string;

    isEmptyPhone(): boolean;

    submit(): void;

    setLoaded(loaded: boolean): void;
}

type PasswordType = 'text' | 'password';

export default class RegistrationController implements IRegistrationController {
    settings?: IRegistrationSettings;
    registration?: IRegistration;
    method?: MethodType;
    email?: string;
    phone?: string;
    partnersRegistrationUrl: string;
    captchaHtml?: string;
    inputPassword: PasswordType = 'password';
    inputPasswordConfirm: PasswordType = 'password';
    redirectTo?: string;
    customerFieldsHtml?: string;
    parentCtrl?: ILoginController;

    /* @ngInject */
    constructor(
        readonly registrationService: IRegistrationService,
        readonly toaster: IToasterService,
        readonly $window: IWindowService,
        readonly $sce: ISCEService,
    ) {
        this.partnersRegistrationUrl = this.buildPartnersRegistrationUrl();
    }

    $onInit() {
        this.setLoaded(true);

        if (this.method === null) {
            this.method = 'full';
        }

        this.registrationService.initRegistration()
            .then((data) => {
                this.settings = data.Settings;
                this.registration = data.Registration;

                if (this.method === 'email') {
                    if (typeof this.email === 'undefined' || this.email === null) {
                        this.method = 'full';
                    } else {
                        this.registration.Email = this.email;
                    }
                } else if (this.method === 'code') {
                    if (typeof this.phone === 'undefined' || this.phone === null) {
                        this.method = 'full';
                    } else {
                        this.registration.Phone = this.phone;
                    }
                }
            })
            .then(() => this.settings?.EnableCaptchaInRegistration === true
                ? this.registrationService.initCaptcha('$ctrl.registration.Captcha')
                : undefined
            )
            .then((captcha) => {
                if (typeof captcha !== 'undefined' && captcha !== null) {
                    this.captchaHtml = this.$sce.trustAsHtml(captcha);
                }
            })
            .then(() => this.registrationService.getCustomerFieldsHtml())
            .then((html) => {
                this.customerFieldsHtml = html;
            })
            .finally(() => {
                this.setLoaded(false);
            });
    };

    switchPasswordType(input: 'inputPassword' | 'inputPasswordConfirm') {
        if (input === 'inputPassword') {
            this.inputPassword = this.inputPassword === 'password' ? 'text' : 'password';
        } else if (input === 'inputPasswordConfirm') {
            this.inputPasswordConfirm = this.inputPasswordConfirm === 'password' ? 'text' : 'password';
        }
    };

    buildPartnersRegistrationUrl() {
        return '/Registration/Account?area=Partners';
    };

    isEmptyPhone() {
        return typeof this.registration === 'undefined'
            || this.registration === null
            || typeof this.registration.Phone === 'undefined'
            || this.registration.Phone === null
            || this.registration.Phone === ''
            || this.registration.Phone === '+_(___)___-__-__';
    };

    submit() {
        if (typeof this.registration !== 'undefined'
            && this.registration !== null
            && typeof this.method !== 'undefined'
            && this.method !== null) {
            if (this.isEmptyPhone()) {
                this.registration.Phone = null;
            }

            const registration = this.registration;
            const method = this.method;

            this.registrationService
                .checkCaptcha()
                .then(() => this.registrationService.submitRegistration(
                    registration,
                    method,
                ))
                .then(() => {
                    if (typeof this.redirectTo !== 'undefined' && this.redirectTo !== null) {
                        this.$window.location.assign(this.redirectTo);
                    } else {
                        this.$window.location.reload();
                    }
                })
                .catch((error) => this.toaster.pop('error', '', error.message));
        }
    };

    setLoaded(loaded: boolean) {
        if (typeof this.parentCtrl !== 'undefined' && this.parentCtrl !== null) {
            this.parentCtrl.loaded = loaded;
        }
    };
}
