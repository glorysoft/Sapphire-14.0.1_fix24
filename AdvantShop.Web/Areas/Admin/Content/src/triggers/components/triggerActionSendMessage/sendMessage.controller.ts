import type { IController, IHttpService } from 'angular';
import type { IMessageVariable, ISendMessageAction } from './sendMessage.types';
import { isResponseError, type Response } from '@/scripts/@types/http';

export interface ITriggerActionSendMessageController extends IController {
    action?: ISendMessageAction;
    messageVariables?: IMessageVariable[];
    modules?: Record<string, string>;
    isEnabled?: boolean;
}

export default class TriggerActionSendMessageController implements ITriggerActionSendMessageController {
    action?: ISendMessageAction;
    messageVariables?: IMessageVariable[];
    modules?: Record<string, string> = {};
    isEnabled?: boolean = false;

    /* @ngInject */
    constructor(readonly $http: IHttpService) {
    }

    $onInit() {
        this.getModules();
    };

    private getModules() {
        this.$http.get<Response<Record<string, string>>>('triggers/getSendMessagesModules')
            .then((response) => {
                if (!isResponseError(response.data)
                    && response.data.obj !== null
                    && typeof response.data.obj !== 'undefined') {
                    this.modules = response.data.obj;

                    if (Object.keys(this.modules).length > 0) {
                        this.isEnabled = true;
                    }
                }
            });
    }
}
