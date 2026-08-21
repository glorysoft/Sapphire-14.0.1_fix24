import { IDirective } from 'angular';


export const textScaleDirectives = (): IDirective => ({
    restrict: 'A',
    require: {
        textScaleLimit: '^textScaleLimit',
        textScaleObserver: '^textScaleObserver',
    },
    bindToController: true,
    scope: false,
    controller: 'TextScaleCtrl',
});

export const textScaleLimitDirectives = (): IDirective => ({
    restrict: 'A',
    scope: false,
    bindToController: true,
    controller: 'TextScaleLimitCtrl',
});

export const textScaleObserverDirectives = (): IDirective => ({
    require: {
        textScaleLimit: '^textScaleLimit',
    },
    restrict: 'A',
    scope: false,
    bindToController: true,
    controller: 'TextScaleObserverCtrl',
});
