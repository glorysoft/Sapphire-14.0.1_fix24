import PhoneService from './phone.service';

const MODULE_NAME = 'phone';

angular.module(MODULE_NAME, [])
    .constant('phoneCodeLength', 4)
    .service('phoneService', PhoneService);

export default MODULE_NAME;
