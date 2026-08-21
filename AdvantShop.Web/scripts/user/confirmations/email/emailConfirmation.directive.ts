import template from './emailConfirmation.template.html';
import type { IAttributes, IDirectiveFactory, IScope } from 'angular';
import { IEmailConfirmationController } from './emailConfirmation.controller';

export interface IEmailConfirmationScope {
    email?: string
    showConfirmation?: boolean,
    confirmed: boolean,
}

type EmailConfirmationDirective = IDirectiveFactory<IScope & IEmailConfirmationScope, JQLite, IAttributes, IEmailConfirmationController>

const emailConfirmation: EmailConfirmationDirective = () => ({
    restrict: 'AE',
    scope: {
        email: '<?',
        showConfirmation: '<?',
        confirmed: '=',
    },
    bindToController: true,
    controller: 'EmailConfirmationController',
    controllerAs: '$ctrl',
    templateUrl: template,
});

export default emailConfirmation;
