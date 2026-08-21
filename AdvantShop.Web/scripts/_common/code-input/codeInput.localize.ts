import { ICodeInputConfig } from './codeInput.config';
import { translate } from 'angular';

export default /* @ngInject */ function(
    codeInputConfig: ICodeInputConfig,
    $translate: translate.ITranslateService,
) {
    codeInputConfig.defaultSendText = $translate.instant('Js.CodeInput.DefaultSendText');
    codeInputConfig.defaultResendText = $translate.instant('Js.CodeInput.DefaultResendText');
};
