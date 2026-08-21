import registrationTemplate from './registration.template.html';

import type { IAttributes, IDirectiveFactory, IScope } from 'angular';
import type { IRegistrationController } from './registration.controller';

type RegistrationDirective = IDirectiveFactory<IScope, JQLite, IAttributes, IRegistrationController>

const registration: RegistrationDirective = () => ({
    require: {
        parentCtrl: '^^login',
    },
    restrict: 'EA',
    scope: {
        method: '<?',
        email: '<?',
        phone: '<?',
        redirectTo: '<?',
    },
    bindToController: true,
    controller: 'RegistrationController',
    controllerAs: '$ctrl',
    templateUrl: registrationTemplate,
});

export { registration };
