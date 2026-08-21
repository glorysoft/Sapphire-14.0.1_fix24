import template from './sendMessage.template.html';

import type { IAttributes, IDirectiveFactory, IScope } from 'angular';
import type { ITriggerActionSendMessageController } from './sendMessage.controller';

type ITriggerActionSendMessageDirective = IDirectiveFactory<
    IScope,
    JQLite,
    IAttributes,
    ITriggerActionSendMessageController
>

const triggerActionSendMessage: ITriggerActionSendMessageDirective = () => ({
    restrict: 'A',
    scope: {
        action: '<?',
        messageVariables: '<?',
    },
    bindToController: true,
    controller: 'TriggerActionSendMessageController',
    controllerAs: '$ctrl',
    templateUrl: template,
});

export default triggerActionSendMessage;
