import { phoneField } from './phoneField.directives';
import PhoneFieldController from "./phoneField.controller";
import phoneConfirmationModule from "../../confirmations/phone/phoneConfirmation";

const MODULE_NAME = 'phoneField';

angular.module(MODULE_NAME, [phoneConfirmationModule])
    .controller('PhoneFieldController', PhoneFieldController)
    .directive('phoneField', phoneField);

export default MODULE_NAME;
