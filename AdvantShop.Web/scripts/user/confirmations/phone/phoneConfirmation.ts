import PhoneConfirmationController from './controllers/phoneConfirmation.controller';
import { phoneConfirmation, phoneConfirmationCode, phoneConfirmationModule } from './phoneConfirmation.directives';
import PhoneConfirmationService from './phoneConfirmation.service';
import PhoneConfirmationModuleController from './controllers/phoneConfirmation.module.controller';

import "./phoneConfirmation.scss"
import PhoneConfirmationCodeController from './controllers/phoneConfirmation.code.controller';
import codeInputModule from '../../../_common/code-input/codeInput';
import captchaModule from '../../../_common/captcha/captcha';
import phoneModule from '../../services/phone/phone';

const MODULE_NAME = 'phoneConfirmation';

angular.module(MODULE_NAME, [codeInputModule, captchaModule, phoneModule])
    .service('phoneConfirmationService', PhoneConfirmationService)
    .controller('PhoneConfirmationController', PhoneConfirmationController)
    .controller('PhoneConfirmationModuleController', PhoneConfirmationModuleController)
    .controller('PhoneConfirmationCodeController', PhoneConfirmationCodeController)
    .directive('phoneConfirmation', phoneConfirmation)
    .directive('phoneConfirmationModule', phoneConfirmationModule)
    .directive('phoneConfirmationCode', phoneConfirmationCode);

export default MODULE_NAME;
