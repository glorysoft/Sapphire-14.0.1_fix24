import { IController } from 'angular';

export interface IPhoneFieldController extends IController {
    confirmed: boolean;
}

export default class PhoneFieldController implements IPhoneFieldController {
    confirmed = false;
}
