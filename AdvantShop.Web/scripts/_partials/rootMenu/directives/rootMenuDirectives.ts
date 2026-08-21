import { IDirective } from 'angular';

export const rootMenuDirective = (): IDirective => ({
        restrict: 'A',
        scope: true,
        controller: 'RootMenuCtrl',
        controllerAs: 'rootMenu',
        bindToController: true,
    });
