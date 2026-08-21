import okAuthTemplate from './okAuth.html';
(function (ng) {
    

    const okAuthCtrl = function (toaster, $translate, okService, $window) {
        const ctrl = this;
        ctrl.validatePrimarySettings = function () {
            okService
                .validatePrimarySettings({
                    applicationPublicKey: ctrl.applicationPublicKey,
                    applicationAccessToken: ctrl.applicationAccessToken,
                    applicationSessionSecretKey: ctrl.applicationSessionSecretKey,
                    groupSocialAccessToken: ctrl.groupSocialAccessToken,
                })
                .then((response) => {
                    if (response.result) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.SettingsCrm.AuthSuccessfulSetupComplete'));
                        $window.location.reload(true);
                    } else {
                        response.errors.forEach((e) => {
                            toaster.pop('error', $translate.instant('Admin.Js.SettingsCrm.FailedLogIn'), e);
                        });
                    }
                });
        };
    };
    okAuthCtrl.$inject = ['toaster', '$translate', 'okService', '$window'];
    ng.module('okAuth', []).controller('okAuthCtrl', okAuthCtrl).component('okAuth', {
        templateUrl: okAuthTemplate,
        controller: 'okAuthCtrl',
    });
})(window.angular);
