import type { ILoginService } from '../login.service';
import type { IAuthRoute, MethodType } from '../login.types';
import type { IController, IScope, IWindowService } from 'angular';
import { AVAILABLE_RENDER_FROM } from '../login.constants';

export interface ILoginStatus<Status extends string> {
    status: Status;
    redirectTo?: string;
    parentCtrl?: ILoginController;

    subscribeToBackButton(): void;

    changeStatus(status: string): void;

    getTitle(status: Status): string;

    getDescription(status: Status): string | undefined;

    getBackStatus(status: Status): Status;

    setLoaded(loaded: boolean): void;

    setTitle(title: string): void;

    setDescription(description: string | undefined): void;

    setShowBack(showBack: boolean): void;

    changeShowRoutes(show: boolean): void;
}

export interface ILoginController extends IController {
    method?: string;
    authModuleId: string | null;
    authModules: IAuthModule[];
    showAuthRoutes: boolean;
    authRoutes: IAuthRoute[];
    title: string;
    description?: string;
    showBack: boolean;
    loaded: boolean;
    redirectTo: string;
    isLanding?: boolean;
    lpId?: number;
    showAuthMethods: boolean;
    renderFrom?: RenderFrom;
    phone: string;
    email: string;

    changeMethod(method: string, moduleId: string): void;

    setAllAuthModuleIds(): void;

    back(method?: MethodType): void;
}

export interface IAuthModule {
    id: string;
    controllerName: string;
}

export type RenderFrom = (typeof AVAILABLE_RENDER_FROM)[number];

function assertsRenderFrom(value: unknown): asserts value is RenderFrom {
    if (typeof value !== 'string' || !AVAILABLE_RENDER_FROM.includes(value as RenderFrom))
        throw new Error(`renderFrom '${value}' not contains in AVAILABLE_RENDER_FROM`);
}

export default class LoginController implements ILoginController {
    method?: MethodType;
    authModuleId: string | null = null;
    authModules: IAuthModule[] = [];
    showAuthRoutes = true;
    authRoutes: IAuthRoute[] = [];
    title = '';
    description?: string;
    showBack = false;
    loaded = false;
    redirectTo: string;
    isLanding?: boolean;
    lpId?: number;
    showAuthMethods = false;
    renderFrom?: RenderFrom;
    phone = '';
    email = '';

    /* @ngInject */
    constructor(
        readonly loginService: ILoginService,
        readonly $scope: IScope,
        readonly $window: IWindowService,
    ) {
        this.redirectTo = this.$window.location.pathname;
    }

    $onInit() {
        this.loaded = true;

        if (typeof this.renderFrom !== 'undefined' && this.renderFrom !== null) {
            assertsRenderFrom(this.renderFrom);
        }
        this.loginService
            .getDefaultMethod()
            .then((method) => (this.method = method))
            .then(() => {
                if (this.method === 'module') {
                    this.loginService.getDefaultAuthModuleId().then((authModuleId) => (this.authModuleId = authModuleId));
                }
            })
            .then(() => this.loginService.getAuthRoutes())
            .then((authRoutes) => {
                this.authRoutes = authRoutes;
                this.setAllAuthModuleIds();
            })
            .finally(() => (this.loaded = false));
    }

    changeMethod(method: MethodType, moduleId: string) {
        this.method = method;
        this.authModuleId = moduleId;

        this.title = '';
        this.description = undefined;
        this.showBack = false;
        this.loaded = true;
    }

    setAllAuthModuleIds() {
        this.authRoutes.forEach((route) => {
            if (
                typeof route.ModuleId !== 'undefined' &&
                route.ModuleId !== null &&
                route.ModuleId !== '' &&
                typeof route.ModuleControllerName !== 'undefined' &&
                route.ModuleControllerName !== null &&
                route.ModuleControllerName !== '' &&
                this.authModules.indexOf({
                    id: route.ModuleId,
                    controllerName: route.ModuleControllerName,
                }) === -1
            ) {
                this.authModules.push({
                    id: route.ModuleId,
                    controllerName: route.ModuleControllerName,
                });
            }
        });
    }

    back(method?: MethodType) {
        switch (method) {
            case 'email':
                this.$scope.$broadcast('backLoginEmail');
                break;
            case 'code':
                this.$scope.$broadcast('backLoginCode');
                break;
            case 'module':
                this.$scope.$broadcast(`backModule${this.authModuleId}`);
                break;
            case undefined:
                break;
            default: {
                const exhaustiveCheck: never = method;
                throw new Error(`Unexpected method ${exhaustiveCheck}`);
            }
        }
    }
}
