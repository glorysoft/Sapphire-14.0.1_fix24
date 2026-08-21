import EmailService from './email.service';

const MODULE_NAME = 'email';

angular.module(MODULE_NAME, [])
    .constant('emailCodeLength', 4)
    .service('emailService', EmailService);

export default MODULE_NAME;
