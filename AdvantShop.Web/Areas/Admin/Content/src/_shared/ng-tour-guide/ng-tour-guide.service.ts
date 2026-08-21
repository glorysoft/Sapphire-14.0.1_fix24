import { TourGuideClient } from '@sjmc11/tourguidejs';
import { IDocumentService, IQService, IWindowService, ILocationService, IRootScopeService, IDeferred, IPromise, ITimeoutService } from 'angular';
import { TourGuideOptions } from '@sjmc11/tourguidejs/src/core/options';
import { TourGuideStep } from '@sjmc11/tourguidejs/src/types/TourGuideStep';

type TourUrlKey = 'tour' | 'tourReset';

const tourUrlKey: Record<TourUrlKey, TourUrlKey> = {
    tour: 'tour',
    tourReset: 'tourReset',
};

type TourVisitParameter = number | 'prev' | 'next' | TourGuideStep;

export function isVisitParam(value: unknown): value is TourVisitParameter {
    if (typeof value === 'undefined' || value === null) {
        return false;
    }
    if (!isNaN(Number(value))) {
        return true;
    }
    if (typeof value === 'string') {
        return value === 'prev' || value === 'next';
    }
    return Object.hasOwn(value, 'content');
}

export interface INgTourGuideService {
    addStepsItem(steps: TourGuideStep): IPromise<void>;

    addWatchVisibility(element: Element): IPromise<unknown>;

    isVisibleElement(element: Element): boolean;

    isTourGuideEnabled(group: string): boolean;

    finishTour(group?: string): void;

    isFinished(group: string): boolean;

    deleteFinishedTour(group: string): boolean;

    start(group?: string): IPromise<unknown>;

    setOptions(options: TourGuideOptions): IPromise<TourGuideClient>;

    visitStep(step: TourVisitParameter): IPromise<unknown>;

    getDialog(): HTMLElement;

    removeStep(step: TourGuideStep): IPromise<unknown>;

    exit(): IPromise<unknown>;

    isDuplicateStep(step: TourGuideStep): boolean;

    updatePositions(): IPromise<unknown>;

    resume(group?: string, stepStart?: TourVisitParameter): IPromise<unknown>;
}

export class NgTourGuideService implements INgTourGuideService {
    private tg: TourGuideClient;
    private isRunnig: boolean;
    private mapListVisibility: Map<HTMLElement, (value: unknown) => void>;
    private mapListGroups: Map<string, IDeferred<boolean>>;
    private mutationObserver?: MutationObserver | null;
    private activeGroup?: string;
    private readonly storageKey: string;
    private stepsLazyCollections: Map<string, string[]>;
    private timerInit?: IPromise<void>;

    /* @ngInject */
    constructor(
        private readonly $document: IDocumentService,
        private readonly $window: IWindowService,
        private readonly ngTourGuideOptions: TourGuideOptions,
        private readonly $q: IQService,
        private readonly $location: ILocationService,
        private readonly $rootScope: IRootScopeService,
        private readonly $timeout: ITimeoutService,
        private readonly urlHelper,
    ) {
        this.storageKey = this.getKeyStorage();
        this.isRunnig = false;
        this.mapListVisibility = new Map();
        this.mapListGroups = new Map();
        this.stepsLazyCollections = new Map<string, string[]>();
        this.tg = new TourGuideClient(this.ngTourGuideOptions);

        this.tg.onAfterExit(() => {
            this.finishTour(this.activeGroup);
            this.activeGroup = undefined;
        });

        this.$rootScope.$on('$locationChangeSuccess', () => {
            const tour = this.getValueInUri();

            if (typeof tour !== 'undefined' && this.mapListGroups.size > 0) {
                const defer = this.mapListGroups.get(tour);
                if (defer) {
                    defer.resolve(true);
                }
            }
        });
    }

    initObserver() {
        if (typeof this.mutationObserver !== 'undefined' && this.mutationObserver !== null) {
            return this.mutationObserver;
        }
        let timerDebounce;
        this.mutationObserver = new MutationObserver(() => {
            if (timerDebounce) {
                clearTimeout(timerDebounce);
            }

            timerDebounce = setTimeout(() => {
                this.checkElements();
            }, 100);
        });

        this.mutationObserver.observe(document.documentElement, { subtree: true, childList: true, attributes: true });

        return this.mutationObserver;
    }

    checkElements() {
        for (const [element, resolve] of Array.from(this.mapListVisibility.entries())) {
            if (element.clientWidth > 0 && element.clientHeight > 0) {
                resolve(true);
                this.mapListVisibility.delete(element);
            }
        }

        // if (this.mapListVisibility.size === 0 && typeof this.mutationObserver !== 'undefined' && this.mutationObserver !== null) {
        //     this.mutationObserver.disconnect();
        //     this.mutationObserver = null;
        // }
    }

    isVisibleElement(element: HTMLElement): boolean {
        const rect = element.getBoundingClientRect();
        const pageY = window.pageYOffset;
        return rect.width > 0 && rect.height > 0 && rect.top + pageY > pageY && rect.top + pageY < pageY + window.innerHeight;
    }

    isTourGuideEnabled(group = 'tour'): boolean {
        return this.activeGroup === group || this.getValueInUri() === group;
    }

    addWatchLocation(group = 'tour') {
        const defer = this.$q.defer<boolean>();
        this.mapListGroups.set(group, defer);
        return defer.promise;
    }

    startLazy(group?: string) {
        const defer = this.$q.defer();

        if ((this.$document[0] as Document).readyState === 'complete') {
            defer.resolve(true);
        } else {
            this.$window.addEventListener('load', () => defer.resolve(true));
        }

        return defer.promise.then(() => this.start(group));
    }

    start(group?: string) {
        this.activeGroup = group;
        return this.$q.when(this.tg.start(group)).then(() => {
            if (this.getValueInUri('tourReset')) {
                this.$location.search('tourReset', null);
            }
            this.tg.dialog.addEventListener('click', (event) => event.stopPropagation());
        });
    }

    addWatchVisibility(element: HTMLElement) {
        const defer = this.$q.defer();
        this.mapListVisibility.set(element, defer.resolve);
        return defer.promise;
    }

    addStepsItem(stepsItem: TourGuideStep) {
        this.initObserver();
        const elementDOM =
            typeof stepsItem.target === 'string'
                ? (this.$document[0] as Document).querySelector<HTMLElement>(stepsItem.target)
                : (stepsItem.target as HTMLElement);

        if (typeof elementDOM === 'undefined' || elementDOM === null) {
            return this.$q.reject(new Error(`ng-tour-guid: not found target`));
        }

        return this.$q
            .when(!this.isTourGuideEnabled(stepsItem.group) ? this.addWatchLocation(stepsItem.group) : true)
            .then(() => (!this.isVisibleElement(elementDOM) ? this.addWatchVisibility(elementDOM) : true))
            .then(() => {
                this.tg.addSteps([stepsItem]).then(() => {
                    if (!this.isRunnig && (!this.isFinished(stepsItem.group) || this.reset(stepsItem.group))) {
                        if (typeof this.timerInit !== 'undefined') {
                            this.$timeout.cancel(this.timerInit);
                        }
                        this.timerInit = this.$timeout(() => {
                            this.isRunnig = true;
                            return this.startLazy(stepsItem.group);
                        }, 1000);
                        return this.timerInit;
                    }
                    return undefined;
                });
            });
    }

    getKeyStorage() {
        return `tourcomplte_${this.urlHelper.transformBaseUriToKey()}`;
    }

    finishTour(group = 'tour') {
        const value = localStorage.getItem(this.storageKey);
        let listComppleted: string[] = [];
        if (value !== null) {
            listComppleted = value.split(',');
        }
        if (listComppleted.includes(group)) {
            throw new Error(`Group "${group}" already completed in tour`);
        }
        listComppleted.push(group);
        localStorage.setItem(this.storageKey, listComppleted.join(','));
        if (this.getValueInUri('tourReset')) {
            this.$location.search('tourReset', null);
        }
    }

    isFinished(group = 'tour') {
        const value = localStorage.getItem(this.storageKey);
        return value !== null && value.split(',').includes(group);
    }

    reset(group = 'tour') {
        const resetParameter = this.getValueInUri('tourReset');
        if (resetParameter === group) {
            this.deleteFinishedTour(group);
            return true;
        }
        return false;
    }

    deleteFinishedTour(group = 'tour') {
        const value = localStorage.getItem(this.storageKey);
        if (value) {
            localStorage.setItem(
                this.storageKey,
                value
                    .split(',')
                    .filter((item) => item !== group)
                    .join(','),
            );
            return true;
        }
        return false;
    }

    getValueInUri(specificKey?: TourUrlKey): string | undefined {
        const uriParams = this.$location.search();
        let key: string | undefined;
        if (typeof specificKey !== 'undefined') {
            key = specificKey;
        } else {
            key = Object.keys(tourUrlKey).find((item) => uriParams[item]);
        }
        if (!key) {
            return undefined;
        }

        const value = uriParams[key];

        if (!value) {
            return undefined;
        }

        return value;
    }

    setOptions(options: TourGuideOptions) {
        return this.$q.when(this.tg.setOptions(options));
    }

    visitStep(step: TourVisitParameter) {
        let visitValue: number | 'prev' | 'next';

        if (typeof step === 'number') {
            visitValue = step;
        } else if (typeof step === 'string') {
            visitValue = step === 'next' ? this.tg.activeStep + 1 : this.tg.activeStep - 1;
        } else {
            const stepIndex = this.tg.tourSteps.indexOf(step);
            if (stepIndex === -1) {
                throw new Error(`ng-tour-guid: not found step for visit`);
            }
            visitValue = stepIndex;
        }
        const stepObj = this.tg.tourSteps[visitValue];

        if (this.isVisibleElement(stepObj.target as HTMLElement)) {
            return this.$q.when(this.tg.visitStep(visitValue));
        }

        return this.addWatchVisibility(stepObj.target as HTMLElement).then(() => this.$q.when(this.tg.visitStep(visitValue)));
    }

    getDialog() {
        return this.tg.dialog;
    }

    private removeStepTimers = new Map<string, IPromise<any>>();

    removeStep(step: TourGuideStep) {
        const stepIndex = this.tg.tourSteps.indexOf(step);
        if (stepIndex !== -1) {
            this.tg.tourSteps.splice(stepIndex, 1);
        }

        const stepIndexInOptions = this.tg.options.steps?.indexOf(step);
        if (typeof stepIndexInOptions !== 'undefined' && stepIndexInOptions !== -1) {
            this.tg.options.steps?.splice(stepIndexInOptions, 1);
        }
        const group = step.group ?? 'tour';
        let timer = this.removeStepTimers.get(group);
        if (timer) {
            this.$timeout.cancel(timer);
        }

        if (typeof this.activeGroup === 'undefined') {
            return this.$q.resolve();
        }

        timer = this.$timeout(() => {
            if (this.isFinished(step.group) || this.activeGroup !== step.group) {
                return true;
            }

            this.tg.activeStep = Math.min(this.tg.activeStep, this.tg.tourSteps.length - 1);
            return this.tg.refresh().then(() => this.tg.visitStep(this.tg.activeStep));
        }, 500);

        this.removeStepTimers.set(group, timer);

        return timer;
    }

    exit() {
        return this.$q.when(this.tg.exit());
    }

    isDuplicateStep(step: TourGuideStep) {
        return this.tg.tourSteps.some((item) => this.stepEqual(step, item));
    }

    stepEqual(step1: TourGuideStep, step2: TourGuideStep) {
        for (const key of Object.keys(step1)) {
            if (typeof step1[key] === 'function' || key === 'target') {
                continue;
            }

            if (step1[key] !== step2[key]) {
                return false;
            }
        }
        return true;
    }

    updatePositions() {
        return this.$q.when((this.tg.activeStep = Math.min(this.tg.activeStep, this.tg.tourSteps.length - 1))).then(() => this.tg.updatePositions());
    }

    resume(group = 'tour', stepStart: TourVisitParameter = 0) {
        this.deleteFinishedTour(group);
        return this.$q.when(this.tg.start(group).then(() => this.visitStep(stepStart)));
    }
}
