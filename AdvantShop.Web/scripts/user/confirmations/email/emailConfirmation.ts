import './emailConfirmation.scss';

import captchaModule from '../../../_common/captcha/captcha';
import emailModule from '../../services/email/email'

import emailConfirmation from './emailConfirmation.directive';
import EmailConfirmationController from './emailConfirmation.controller';
import emailConfirmationConfig from './emailConfirmation.config';
import emailConfirmationLocalize from './emailConfirmation.localize';

const MODULE_NAME = 'emailConfirmation';

angular.module(MODULE_NAME, [captchaModule, emailModule])
    .constant('emailConfirmationConfig', emailConfirmationConfig)
    .directive('emailConfirmation', emailConfirmation)
    .controller('EmailConfirmationController', EmailConfirmationController)
    .run(emailConfirmationLocalize);

export default MODULE_NAME;
