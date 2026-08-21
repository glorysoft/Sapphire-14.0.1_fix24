import { IController } from 'angular';

export interface IEmailFieldController extends IController {
    confirmed: boolean;
}

export default class EmailFieldController implements IEmailFieldController {
    confirmed = false;
}
