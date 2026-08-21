import '../../../styles/partials/login.scss';

import './styles/login.style.scss';
import './styles/loginOpenId.style.scss';

import '../../../fonts/fa.scss';

import registrationModule from '../registration/registration.module';
import captchaModule from '../../_common/captcha/captcha';
import emailModule from '../services/email/email';
import phoneModule from '../services/phone/phone';

import LoginService from './login.service';
import LoginModalController from './controllers/login.modal.controller';
import LoginController from './controllers/login.controller';
import LoginEmailController from './controllers/login.email.controller';
import LoginCodeController from './controllers/login.code.controller';
import LoginModuleController from './controllers/login.module.controller';
import {
    login,
    loginCode,
    loginEmail,
    loginModal,
    loginModule,
    loginOpenId,
    loginHeader,
    loginAuthMethods,
} from './login.directives';

const MODULE_NAME = 'login';

angular.module(MODULE_NAME, [registrationModule, captchaModule, emailModule, phoneModule])
    .service('loginService', LoginService)
    .controller('LoginModalController', LoginModalController)
    .controller('LoginController', LoginController)
    .controller('LoginEmailController', LoginEmailController)
    .controller('LoginCodeController', LoginCodeController)
    .controller('LoginModuleController', LoginModuleController)
    .directive('loginModal', loginModal)
    .directive('login', login)
    .directive('loginModule', loginModule)
    .directive('loginEmail', loginEmail)
    .directive('loginCode', loginCode)
    .directive('loginHeader', loginHeader)
    .directive('loginOpenId', loginOpenId)
    .directive('loginAuthMethods', loginAuthMethods);

export default MODULE_NAME;
