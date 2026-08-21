import { IAttributes, IDirective, IParseService, IQService, IScope } from 'angular';
import { INgTourGuideService, isVisitParam } from './ng-tour-guide.service';
import { TourGuideStep } from '@sjmc11/tourguidejs/src/types/TourGuideStep';

type CallbackShortsName = 'exit' | 'visitStep' | 'resume';

function isCallbackShortsName(value: unknown): value is CallbackShortsName {
    return typeof value === 'string' && ['exit', 'visitStep', 'resume'].includes(value);
}

interface NgTgTourAttrs extends IAttributes {
    ngTgTitle?: string;
    ngTgTour?: string;
    ngTgFixed?: string;
    ngTgOrder?: string;
    ngTgGroup?: string;
    ngTgPropagateEvents?: string;

    ngTgBeforeEnter?: string;
    ngTgBeforeEnterToNext?: string;
    ngTgBeforeEnterToPrev?: string;

    ngTgAfterEnter?: string;
    ngTgAfterEnterToNext?: string;
    ngTgAfterEnterToPrev?: string;

    ngTgBeforeLeave?: string;
    ngTgBeforeLeaveToNext?: string;
    ngTgBeforeLeaveToPrev?: string;

    ngTgAfterLeave?: string;
    ngTgAfterLeaveToNext?: string;
    ngTgAfterLeaveToPrev?: string;
}

/* @ngInject */
export const ngTgTour = function($parse: IParseService, ngTourGuideService: INgTourGuideService, $q:IQService): IDirective<IScope, JQLite, NgTgTourAttrs> {
    return {
        restrict: 'A',
        scope: true,
        link(scope, element, attrs) {
            if (typeof attrs.ngTgTour === 'undefined' || attrs.ngTgTour.length === 0) {
                throw new Error('Attribute "ng-tg-tour" is undefined or empty');
            }
            const step: TourGuideStep = {
                title: typeof attrs.ngTgTitle !== 'undefined' ? $parse(attrs.ngTgTitle)(scope) : undefined,
                content: $parse(attrs.ngTgTour)(scope),
                target: element[0],
                dialogTarget: null,
                fixed: typeof attrs.ngTgFixed !== 'undefined' ? $parse(attrs.ngTgFixed)(scope) : undefined,
                order: typeof attrs.ngTgOrder !== 'undefined' ? $parse(attrs.ngTgOrder)(scope) : undefined,
                group: typeof attrs.ngTgGroup !== 'undefined' ? $parse(attrs.ngTgGroup)(scope) : undefined,
                propagateEvents: typeof attrs.ngTgPropagateEvents !== 'undefined' ? $parse(attrs.ngTgPropagateEvents)(scope) : true,
                beforeEnter: (currentStep: TourGuideStep, nextStep: TourGuideStep) => {
                    $q.when(callbackFire('ngTgBeforeEnter', { currentStep, nextStep }))
                        .then(() => {
                            if (nextStep.target) {
                                const el = typeof nextStep.target === 'string' ? document.querySelector(nextStep.target) : nextStep.target;
                                if (el) {
                                    el.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'center',
                                    });
                                }
                            }
                        })
                },
                afterEnter: (currentStep: TourGuideStep, nextStep: TourGuideStep) => {
                    setTimeout(() => ngTourGuideService.updatePositions().then(() => {
                        callbackFire('ngTgAfterEnter', { currentStep, nextStep })
                    }), 100);
                },
                beforeLeave: (currentStep: TourGuideStep, nextStep: TourGuideStep) => {
                    callbackFire('ngTgBeforeLeave', { currentStep, nextStep });
                },
                afterLeave: (currentStep: TourGuideStep, nextStep: TourGuideStep) => {
                    callbackFire('ngTgAfterLeave', { currentStep, nextStep });
                },
            };

            const callbackShorts = new Map<CallbackShortsName, (stepValue: TourGuideStep, ...args: unknown[]) => void>();
            callbackShorts.set('exit', () => {
                ngTourGuideService.exit();
            });
            callbackShorts.set('visitStep', (_stepValue, visitParam) => {
                if (isVisitParam(visitParam)) {
                    ngTourGuideService.visitStep(visitParam);
                } else {
                    throw new Error('Missing parameter "visitParam" for callbackShorts "visitStep"');
                }
            });
            callbackShorts.set('resume', (stepValue, visitParam) => {
                if (isVisitParam(visitParam)) {
                    ngTourGuideService.resume(stepValue.group, visitParam ?? stepValue);
                } else {
                    throw new Error('Missing parameter "visitParam" for callbackShorts "resume"');
                }
            });
            const callbackShortFire = (callbackName: CallbackShortsName, ...params) => {
                const fn = callbackShorts.get(callbackName);
                if (typeof fn !== 'undefined') {
                    //@ts-expect-error параметры могут быть разными
                    // eslint-disable-next-line prefer-spread
                   return  $q.when(fn.apply(null, [step].concat(params)) ?? true);
                }
                return $q.resolve();
            };

            const callbackFire = (name: string, { currentStep, nextStep }) => {
                if (typeof attrs[name] !== 'undefined') {
                    const parseResult = $parse(attrs[name])(scope, { currentStep, nextStep });
                    if (isCallbackShortsName(parseResult)) {
                       return callbackShortFire(parseResult);
                    }
                    return $q.when(parseResult ?? true);
                }
                if (typeof currentStep.order === 'undefined' || typeof nextStep.order === 'undefined') {
                    return $q.resolve();
                }
                if (currentStep.order < nextStep.order && typeof attrs[`${name}ToNext`] !== 'undefined') {
                    const parseResult = $parse(attrs[`${name}ToNext`])(scope, { currentStep, nextStep });
                    if (isCallbackShortsName(parseResult)) {
                        return callbackShortFire(parseResult);
                    }
                    return $q.when(parseResult ?? true);
                }
                if (currentStep.order > nextStep.order && typeof attrs[`${name}ToPrev`] !== 'undefined') {
                    const parseResult = $parse(attrs[`${name}ToPrev`])(scope, { currentStep, nextStep });
                    if (isCallbackShortsName(parseResult)) {
                        return callbackShortFire(parseResult);
                    }
                    return $q.when(parseResult?? true);
                }
                return  $q.resolve();
            };

            element.on('$destroy', () => {
                ngTourGuideService.removeStep(step);
            });

            //@ts-expect-error прописать типы для скоупа
            scope.ngTour = {
                callbackShortFire,
            };
            if (!ngTourGuideService.isDuplicateStep(step)) {
                ngTourGuideService.addStepsItem(step).then(() => {
                    if (typeof attrs.ngTgHideNav !== 'undefined') {
                        const isHideNav = $parse(attrs.ngTgHideNav)(scope) === true;
                        let hideNavOptions = {
                            dialogClass: '',
                            showButtons: false,
                            showStepProgress: false,
                            showStepDots: false,
                        };
                        if (!isHideNav) {
                            hideNavOptions = {
                                dialogClass: '',
                                showButtons: true,
                                showStepProgress: true,
                                showStepDots: true,
                            };
                        }
                        const options = { ...hideNavOptions };
                        ngTourGuideService.setOptions(options);
                        ngTourGuideService.getDialog().classList[isHideNav ? 'add' : 'remove']('ng-tg-dialog--hide-nav');
                    }

                    if (typeof attrs.ngTgForceShow !== 'undefined' && $parse(attrs.ngTgForceShow)(scope)) {
                        ngTourGuideService.visitStep(step);
                    }
                });
            }
        },
    };
};
