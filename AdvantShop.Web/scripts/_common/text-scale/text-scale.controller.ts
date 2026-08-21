import { IAugmentedJQuery, IParseService, IScope } from 'angular';
import {
    ITextScaleOptions,
    ITextScaleService,
    ITextScaleController, ITextScaleLimitController, ITextScaleObserverController, TextScaleAttrs,
    ITextScaleInitFnResult,
} from './text-scale.types';

class TextScaleController implements ITextScaleController {
    public options: ITextScaleOptions | undefined;
    public textScaleLimit: ITextScaleLimitController | undefined;
    public textScaleObserver: ITextScaleObserverController | undefined;

    /* @ngInject */
    constructor(
        private readonly $element: IAugmentedJQuery,
        private readonly $scope: IScope,
        private readonly $attrs: TextScaleAttrs,
        private readonly $parse: IParseService,
        private readonly textScaleService: ITextScaleService,
    ) {
    }

    $postLink(): void {
        if (typeof this.textScaleLimit === 'undefined') {
            throw new Error(`textScale: parent directive "textScaleLimit" is required.`);
        }

        if (typeof this.textScaleObserver === 'undefined') {
            throw new Error(`textScale: parent directive "textScaleObserver" is required.`);
        }

        const textScaleLimit = this.textScaleLimit,
            textScaleObserver = this.textScaleObserver;

        this.options = this.$attrs.textScale ? (this.$parse(this.$attrs.textScale)(this.$scope) ?? {}) : {};

        let initFnResult: ITextScaleInitFnResult | undefined;

        const scopeEvents = this.$attrs.textScaleScopeEvents ? this.$parse(this.$attrs.textScaleScopeEvents)(this.$scope) : undefined;

        if (typeof scopeEvents !== 'undefined') {
            (Array.isArray(scopeEvents) ? scopeEvents : [scopeEvents]).forEach((scopeEventsItem) => {
                this.$scope.$on(scopeEventsItem, () => {
                    if (!initFnResult) {
                        initFnResult = this.textScaleService.initElement(this.$element[0], textScaleLimit, textScaleObserver, this.options);
                    } else {
                        initFnResult.calc();
                    }
                });
            });
        } else {
            initFnResult = this.textScaleService.initElement(this.$element[0], textScaleLimit, textScaleObserver, this.options);
        }

        this.$element.on('$destroy', () => {
            initFnResult?.destroy();
        });
    }
}

export default TextScaleController;
