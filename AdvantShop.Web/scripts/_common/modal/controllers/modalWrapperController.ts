import type { IAugmentedJQuery, ICompileService, IScope, ITimeoutService, ITranscludeFunction } from 'angular';
import { TARGET_TRANSCLUDE_NAMES, TARGETS_TRANSCLUDE } from './modalController';

type TargetTranscludeNameValues = (typeof TARGET_TRANSCLUDE_NAMES)[keyof typeof TARGET_TRANSCLUDE_NAMES];
type TargetsTranscludeValues = (typeof TARGETS_TRANSCLUDE)[TargetTranscludeNameValues];
export class ModalWrapperController {
    /* @ngInject */
    constructor(
        private $element: IAugmentedJQuery,
        private readonly $timeout: ITimeoutService,
        private readonly $compile: ICompileService,
        private readonly $scope: IScope,
    ) {
        this.$scope.$on('$destroy', () => {
            this.resetCSSCustomProperties();
        });
    }
    transcludeContent(
        scope: IScope,
        transclude: ITranscludeFunction | undefined,
        target: TargetsTranscludeValues,
        name: TargetTranscludeNameValues,
    ): void {
        const scopeNew = scope.$parent.$new();
        const container = this.$element.find(`.${target}`);
        if (container?.length && transclude) {
            transclude(scopeNew, (clonedElement) => {
                if (!clonedElement) {
                    return;
                }
                container.append(clonedElement);
                this.$timeout(() => {
                    this.setCSSCustomProperty(name, `${container[0].offsetHeight}px`);
                });
            });
        }
    }

    setCSSCustomProperty(name: TargetTranscludeNameValues, value: string | null, priority?: string) {
        this.$element[0].style.setProperty(`--${name}`, value, priority);
    }

    resetCSSCustomProperties() {
        Object.keys(TARGETS_TRANSCLUDE).forEach((prop) => {
            this.$element[0].style.removeProperty(`--${prop}`);
        });
    }
}
