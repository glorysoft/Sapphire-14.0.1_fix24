import loginTemplate from './templates/login.template.html';
import loginEmailTemplate from './templates/login.email.template.html';
import loginCodeTemplate from './templates/login.code.template.html';

import type { IAttributes, IDirectiveFactory, ISCEService, IScope } from 'angular';
import type { ILoginModalController } from './controllers/login.modal.controller';
import type { ILoginController, RenderFrom } from './controllers/login.controller';
import type { ILoginEmailController } from './controllers/login.email.controller';
import type { ILoginCodeController } from './controllers/login.code.controller';
import type { ILoginModuleController } from './controllers/login.module.controller';
import type { IAuthRoute } from './login.types';

export interface LoginProps {
    redirectTo?: string;
    renderFrom?: RenderFrom;
    lpId?: number;
}

interface LoginScope extends IScope, LoginProps {}

interface LoginModalScope extends IScope, LoginScope {}

type LoginDirective = IDirectiveFactory<LoginScope, JQLite, IAttributes, ILoginController>;

type LoginModalDirective = IDirectiveFactory<LoginModalScope, JQLite, IAttributes, ILoginModalController>;

type LoginModuleDirective = IDirectiveFactory<IScope, JQLite, IAttributes, ILoginModuleController>;

type LoginEmailDirective = IDirectiveFactory<IScope, JQLite, IAttributes, ILoginEmailController>;

type LoginCodeDirective = IDirectiveFactory<IScope, JQLite, IAttributes, ILoginCodeController>;

type LoginHeaderDirective = IDirectiveFactory<IScope, JQLite, IAttributes>;

type LoginAuthMethodsDirective = IDirectiveFactory<ILoginAuthMethodsScope, JQLite, IAttributes>;

type LoginOpenIdDirective = IDirectiveFactory<IScope, JQLite, IAttributes>;

interface ILoginAuthMethodsScope extends IScope {
    authRoutes?: IAuthRoute[];
    method?: string;
    moduleId?: string;
    redirectTo?: string;
    routeFn?: (...args: unknown[]) => unknown;
}

const login: LoginDirective = () => ({
    restrict: 'EA',
    scope: {
        redirectTo: '<?',
        renderFrom: '<?',
        lpId: '<?',
    },
    bindToController: true,
    controller: 'LoginController',
    controllerAs: '$ctrl',
    templateUrl: loginTemplate,
});

const loginModal: LoginModalDirective = () => ({
    restrict: 'EA',
    scope: {
        redirectTo: '<?',
        renderFrom: '<?',
        lpId: '<?',
        onClose: '<?',
    },
    transclude: true,
    replace: true,
    bindToController: true,
    controller: 'LoginModalController',
    controllerAs: '$ctrl',
    template: (_elem, _attr) => `<div class="cursor-pointer" data-ng-transclude></div>`,
    link: (_scope, element, _attrs, ctrls) => {
        if (typeof ctrls !== 'undefined' && ctrls !== null) {
            element[0].addEventListener('click', (_event) => {
                ctrls.openModal();
            });
        }
    },
});

const loginModule: LoginModuleDirective = () => ({
    restrict: 'EA',
    scope: {
        id: '<?',
        controllerName: '<?',
        redirectTo: '<?',
    },
    controller: 'LoginModuleController',
    controllerAs: '$ctrl',
    bindToController: true,
    template: (_elem, _attr) => `
            <div class="login-module"
                 data-ng-include
                 data-src="$ctrl.src"></div>
        `,
});

const loginEmail: LoginEmailDirective = () => ({
    require: {
        parentCtrl: '^^login',
    },
    restrict: 'EA',
    scope: {
        redirectTo: '<?',
        lpId: '<?',
    },
    bindToController: true,
    controller: 'LoginEmailController',
    controllerAs: '$ctrl',
    templateUrl: loginEmailTemplate,
});

const loginCode: LoginCodeDirective = () => ({
    require: {
        parentCtrl: '^^login',
    },
    restrict: 'EA',
    scope: {
        redirectTo: '<?',
    },
    bindToController: true,
    controller: 'LoginCodeController',
    controllerAs: '$ctrl',
    templateUrl: loginCodeTemplate,
});

const loginHeader: LoginHeaderDirective = () => ({
    restrict: 'EA',
    scope: {
        title: '<?',
        description: '<?',
        showBack: '<?',
        backFn: '&',
    },
    template: (_elem, _attr) => `
            <div class="login-header">
                <div class="login-header__title-group"
                     data-ng-class="{
                        'login-header__title-group--link': showBack
                     }"
                     data-ng-if="showBack || title.length > 0"
                     data-ng-click="showBack ? backFn() : undefined">
                    <span href=""
                       class="login-header__back"
                       title="{{ 'Js.Login.Title.Back' | translate}}"
                       data-ng-if="showBack === true">
                    </span>
                    <span class="login-header__title"
                          data-ng-bind-html="title">
                    </span>
                </div>
                <div class="login-header__description"
                     data-ng-bind-html="description"
                     data-ng-if="description != null && description !== ''">
                </div>
            </div>

        `,
});

/* @ngInject */
const loginAuthMethods: LoginAuthMethodsDirective = () => ({
    restrict: 'EA',
    scope: {
        redirectTo: '<',
        authRoutes: '<?',
        method: '<?',
        moduleId: '<?',
        routeFn: '&',
    },
    template: () => `
            <div class="login-auth-methods__or">
                <hr class="login-auth-methods__or-line" />
                <span>{{ ::'Js.Login.AuthMethods.Or' | translate }}</span>
                <hr class="login-auth-methods__or-line" />
            </div>
            <div class="login-auth-methods__routes"
                 data-ng-if="authRoutes != null && authRoutes.length > 1">
                <a href=""
                   class="login-auth-methods__route"
                   data-ng-class="{'login-auth-methods__module-route': authRoute.Method === 'module'}"
                   data-ng-repeat="authRoute in authRoutes"
                   data-ng-if="!(authRoute.Method === method && authRoute.ModuleId === moduleId)"
                   data-ng-click="routeFn({method: authRoute.Method, moduleId: authRoute.ModuleId});"
                   data-ng-bind-html="authRoute.Title | sanitize">
                </a>
            </div>
            <login-open-id class="login-auth-methods__open-id"
                           data-redirect-to="redirectTo">
            </login-open-id>
        `,
});

const loginOpenId: LoginOpenIdDirective = () => ({
    restrict: 'EA',
    scope: {
        redirectTo: '<',
    },
    template: (_elem, _attr) => `
            <div class="login-open-id"
                 data-ng-include
                 data-src="'user/openId?redirectTo=' + redirectTo"></div>
        `,
});

export { login, loginModal, loginModule, loginEmail, loginCode, loginHeader, loginOpenId, loginAuthMethods };
