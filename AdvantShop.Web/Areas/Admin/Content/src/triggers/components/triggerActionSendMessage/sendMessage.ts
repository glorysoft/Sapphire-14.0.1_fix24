import triggerActionSendMessage from './sendMessage.directive';
import TriggerActionSendMessageController from './sendMessage.controller';

angular.module('triggers')
    .controller('TriggerActionSendMessageController', TriggerActionSendMessageController)
    .directive('triggerActionSendMessage', triggerActionSendMessage);
