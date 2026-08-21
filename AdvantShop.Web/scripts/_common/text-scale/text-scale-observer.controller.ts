import { IAttributes, IAugmentedJQuery, IParseService, IScope } from 'angular';
import {
    ITextScaleLimitController,
    ITextScaleObserverController,
    TextScalePropsWatch,
} from './text-scale.types';

class TextScaleObserverController implements ITextScaleObserverController {
    public element!: HTMLElement;
    public propsWatch!: TextScalePropsWatch;
    public textScaleLimit!: ITextScaleLimitController;
    public isRegistered = false;
    /* @ngInject */
    constructor(
        private readonly $attrs: IAttributes,
        private readonly $element: IAugmentedJQuery,
        private readonly $parse: IParseService,
        private readonly $scope: IScope,
    ) {}

    $onInit() {
        this.element = this.$element[0];
        this.propsWatch = this.$attrs.propsWatch ? this.$parse(this.$attrs.propsWatch)(this.$scope) : 'both';
    }
}

export default TextScaleObserverController;
