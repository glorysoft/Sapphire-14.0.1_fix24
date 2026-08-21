import type { IController } from 'angular';

export interface IPhoneConfirmationModuleController extends IController {
    src: string;
    controllerName: string;

    initSrc(): void;
}

export default class PhoneConfirmationModuleController implements IPhoneConfirmationModuleController {
    controllerName = '';
    src = '';

    $onInit() {
        this.initSrc();
    };

    initSrc() {
        this.src = `module/${this.controllerName}/phoneConfirmation`;
    };
}
