import { IController, IScope, translate } from 'angular';
import type { IPhoneConfirmationService } from '../phoneConfirmation.service';

export interface IPhoneConfirmationController extends IController {
    phone: string;
    confirmedPhone: string;
    showCodeConfirmation: boolean;
    confirmed: boolean;
    modulesControllerNames: string[];
    phoneConfirmedText: string;
    phoneNotConfirmedText: string;
    phoneDispatch?: () => void;
}

export default class PhoneConfirmationController implements IPhoneConfirmationController {
    phone = '';
    confirmedPhone = '';
    showCodeConfirmation = false;
    confirmed = false;
    modulesControllerNames: string[] = [];
    phoneConfirmedText = '';
    phoneNotConfirmedText = '';
    phoneDispatch?: () => void;

    /* @ngInject */
    constructor(
        readonly phoneConfirmationService: IPhoneConfirmationService,
        readonly $scope: IScope,
        readonly $translate: translate.ITranslateService
    ) {
    }

    $onInit() {
        this.confirmed = false;
        this.phoneConfirmedText = this.$translate.instant('Js.PhoneConfirmation.PhoneConfirmed');
        this.phoneNotConfirmedText = this.$translate.instant('Js.PhoneConfirmation.PhoneNotConfirmed');

        this.phoneConfirmationService.init().then((data) => {
            this.showCodeConfirmation = data.ShowCodeConfirmation;
            this.modulesControllerNames = data.ModulesControllerNames;
        });

        this.phoneDispatch = this.$scope.$watch('$ctrl.phone', (newValue, _oldValue) => {
            this.confirmed = this.confirmedPhone === newValue;
        });
    };

    $onDestroy() {
        if (typeof this.phoneDispatch !== 'undefined' && this.phoneDispatch !== null) {
            this.phoneDispatch();
        }
    };
}
