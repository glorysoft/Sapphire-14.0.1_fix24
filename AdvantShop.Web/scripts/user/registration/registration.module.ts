import flatpickrModule from '../../../vendors/flatpickr/flatpickr.module';

import './registration.style.scss';

import RegistrationController from './registration.controller';
import RegistrationService from './registration.service';
import { registration } from './registration.directives';
import phoneFieldModule from '../fields/phone/phoneField';
import emailFieldModule from '../fields/email/emailField';

const MODULE_NAME = 'registration';

angular.module(MODULE_NAME, [flatpickrModule, phoneFieldModule, emailFieldModule])
    .controller('RegistrationController', RegistrationController)
    .service('registrationService', RegistrationService)
    .directive('registration', registration);

export default MODULE_NAME;
