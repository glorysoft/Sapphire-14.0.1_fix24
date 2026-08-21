import phoneFieldTemplate from './phoneField.templates.html';

import type { IAttributes, IDirectiveFactory, IScope } from 'angular';
import type { IPhoneFieldController } from './phoneField.controller';

type PhoneFieldDirective = IDirectiveFactory<IScope, JQLite, IAttributes, IPhoneFieldController>

const phoneField: PhoneFieldDirective = () => ({
    restrict: 'EA',
    scope: {
        ngModel: '=',
        ngRequired: '=?',
        label: '<?',
        showPhoneConfirmation: '<?',
        enableMask: '<?',
    },
    bindToController: true,
    controller: 'PhoneFieldController',
    controllerAs: '$ctrl',
    templateUrl: phoneFieldTemplate,
});


export { phoneField };
