import '../../../styles/common/tooltip.scss';
import tooltip from 'angular-ui-bootstrap/src/tooltip/index.js';
import { SpinboxCtrl } from './controllers/spinboxController.js';
import { spinboxDirective, spinboxInputDirective } from './directives/spinboxDirectives.js';

const moduleName = 'spinbox';

angular
    .module(moduleName, [tooltip])
    .constant('spinboxKeyCodeAllow', {
        backspace: 8,
        delete: 46,
        decimalPoint: 110,
        comma: 188,
        period: 190,
        forwardSlash: 191,
        leftArrow: 37,
        rightArrow: 39,
        upArrow: 38,
        downArrow: 40,
    })
    .constant('spinboxTooltipTextType', {
        min: 'MIN',
        max: 'MAX',
        multiplicity: 'MULTIPLICITY',
    })
    .constant('spinboxConstants', {
        TOOLTIP_TIMER: 3000,
        MAX_DEFAULT: 1_000_000,
        MIN_DEFAULT: 0,
    })
    .directive('spinbox', spinboxDirective)
    .directive('spinboxInput', spinboxInputDirective)
    .controller('SpinboxCtrl', SpinboxCtrl);

export default moduleName;
