import textScaleService from './text-scale.service';
import TextScaleController from './text-scale.controller';
import { textScaleDirectives, textScaleLimitDirectives, textScaleObserverDirectives } from './text-scale.directives';
import { textScaleDefaultOptions } from './text-scale.constants';
import TextScaleLimitController from '@/scripts/_common/text-scale/text-scale-limit.controller';
import TextScaleObserverController from '@/scripts/_common/text-scale/text-scale-observer.controller';

const moduleName = 'textScale';

angular
    .module(moduleName, [])
    .service('textScaleService', textScaleService)
    .controller('TextScaleCtrl', TextScaleController)
    .controller('TextScaleLimitCtrl', TextScaleLimitController)
    .controller('TextScaleObserverCtrl', TextScaleObserverController)
    .directive('textScale', textScaleDirectives)
    .directive('textScaleLimit', textScaleLimitDirectives)
    .directive('textScaleObserver', textScaleObserverDirectives)
    .constant('textScaleDefaultOptions', textScaleDefaultOptions);

export default moduleName;
