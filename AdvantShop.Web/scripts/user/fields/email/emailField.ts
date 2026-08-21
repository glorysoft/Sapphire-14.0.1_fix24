import emailField from './emailField.directive';
import EmailFieldController from './emailField.controller';
import emailConfirmationModule from "../../confirmations/email/emailConfirmation";

const MODULE_NAME = 'emailField';

angular.module(MODULE_NAME, [emailConfirmationModule])
    .controller('EmailFieldController', EmailFieldController)
    .directive('emailField', emailField);

export default MODULE_NAME;
