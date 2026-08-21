import type { IController, IScope } from 'angular';

export interface ILoginModuleController extends IController {
    id?: string;
    controllerName?: string;
    showRoutes: boolean;
    src: string;
    redirectTo?: string;

    initSrc(): void;
}

export default class LoginModuleController implements ILoginModuleController {
    id?: string;
    controllerName?: string;
    showRoutes = true;
    src = '';
    redirectTo?: string;

    /* @ngInject */
    constructor(readonly $scope: IScope) {
    }

    $onInit() {
        this.initSrc();
    };

    initSrc() {
        this.src = `module/${this.controllerName}/login${this.redirectTo != null ? `?redirectTo=${this.redirectTo}` : ''}`;
    };
}
