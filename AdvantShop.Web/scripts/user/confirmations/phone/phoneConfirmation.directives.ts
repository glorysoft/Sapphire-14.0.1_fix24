import phoneConfirmationTemplate from './templates/phoneConfirmation.templates.html';
import phoneConfirmationCodeTemplate from './templates/phoneConfirmation.code.templates.html';

import type { IAttributes, IDirectiveFactory, IScope } from 'angular';
import type { IPhoneConfirmationController } from './controllers/phoneConfirmation.controller';
import type { IPhoneConfirmationModuleController } from './controllers/phoneConfirmation.module.controller';
import { IPhoneConfirmationCodeController } from './controllers/phoneConfirmation.code.controller';

type PhoneConfirmationDirective = IDirectiveFactory<IScope, JQLite, IAttributes, IPhoneConfirmationController>

type PhoneConfirmationModuleDirective = IDirectiveFactory<IScope, JQLite, IAttributes, IPhoneConfirmationModuleController>

type PhoneConfirmationCodeDirective = IDirectiveFactory<IScope & IPhoneConfirmationCodeScope, JQLite, IAttributes, IPhoneConfirmationCodeController>

const phoneConfirmation: PhoneConfirmationDirective = () => ({
    restrict: 'EA',
    scope: {
        phone: '<?',
        showCodeConfirmation: '<?',
        confirmed: '=',
    },
    bindToController: true,
    controller: 'PhoneConfirmationController',
    controllerAs: '$ctrl',
    templateUrl: phoneConfirmationTemplate,
});

const phoneConfirmationModule: PhoneConfirmationModuleDirective = () => ({
    restrict: 'EA',
    scope: {
        controllerName: '<?',
    },
    replace: false,
    controller: 'PhoneConfirmationModuleController',
    controllerAs: '$ctrl',
    bindToController: true,
    template: (_elem, _attr) => `
            <div data-ng-include
                 data-src="$ctrl.src"></div>
        `,
});

export interface IPhoneConfirmationCodeScope {
    phone?: string;
    confirmed: boolean;
}

const phoneConfirmationCode: PhoneConfirmationCodeDirective = () => ({
    restrict: 'EA',
    scope: {
        phone: '=?',
        confirmed: '=',
    },
    bindToController: true,
    controller: 'PhoneConfirmationCodeController',
    controllerAs: '$ctrl',
    templateUrl: phoneConfirmationCodeTemplate,
});

export { phoneConfirmation, phoneConfirmationModule, phoneConfirmationCode };
