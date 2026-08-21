import { IAugmentedJQuery } from 'angular';
import type {
    ITextScaleLimitController
} from './text-scale.types';

class TextScaleLimitController implements ITextScaleLimitController {
    public element!: HTMLElement;

    /* @ngInject */
    constructor(
        private readonly $element: IAugmentedJQuery
    ) {}

    $onInit() {
        this.element = this.$element[0];
    }
}

export default TextScaleLimitController;
