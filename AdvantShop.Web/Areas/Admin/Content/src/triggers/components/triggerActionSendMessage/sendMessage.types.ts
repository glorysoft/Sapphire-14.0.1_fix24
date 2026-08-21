export interface ISendMessageAction {
    SendMessageData: ISendMessageActionData;
    MessageText: string;
}

export interface ISendMessageActionData {
    ModuleNames: string[];
}

export interface IMessageVariable {
    Key: string;
    Description: string;
}
