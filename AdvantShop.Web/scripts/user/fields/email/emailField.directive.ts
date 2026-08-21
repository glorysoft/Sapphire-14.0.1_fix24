import template from './emailField.templates.html';

import type { IAttributes, IDirectiveFactory, IScope } from 'angular';
import { IEmailFieldController } from './emailField.controller';

export interface IEmailFieldScope {
    ngModel: string,
    ngRequired?: boolean,
    showEmailConfirmation?: boolean,
}

type EmailFieldDirective = IDirectiveFactory<IScope & IEmailFieldScope, JQLite, IAttributes, IEmailFieldController>

const emailField: EmailFieldDirective = () => ({
    restrict: 'EA',
    scope: {
        ngModel: '=',
        ngRequired: '=?',
        showEmailConfirmation: '<?',
    },
    bindToController: true,
    controller: 'EmailFieldController',
    controllerAs: '$ctrl',
    templateUrl: template,
});

export default emailField;
