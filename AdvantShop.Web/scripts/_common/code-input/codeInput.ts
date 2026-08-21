import codeInput from './codeInput.directive';
import CodeInputController from './codeInput.controller';
import codeInputConfig from './codeInput.config';
import codeInputLocalize from './codeInput.localize';

import './codeInput.scss';

const MODULE_NAME = 'CodeInput';

angular.module(MODULE_NAME, [])
    .constant('codeInputConfig', codeInputConfig)
    .directive('codeInput', codeInput)
    .controller('CodeInputController', CodeInputController)
    .run(codeInputLocalize);

export default MODULE_NAME;
