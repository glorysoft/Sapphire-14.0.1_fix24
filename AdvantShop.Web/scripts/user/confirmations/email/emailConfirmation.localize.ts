import { translate } from 'angular';
import { IEmailConfirmationConfig } from './emailConfirmation.config';

export default /* @ngInject */ function(
    emailConfirmationConfig: IEmailConfirmationConfig,
    $translate: translate.ITranslateService,
) {
    emailConfirmationConfig.emailConfirmedText = $translate.instant('Js.EmailConfirmation.EmailConfirmedText');
    emailConfirmationConfig.emailNotConfirmedText = $translate.instant('Js.EmailConfirmation.EmailNotConfirmedText');
};
