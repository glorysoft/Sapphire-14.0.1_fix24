(function (ng) {
    

    const ForgotPasswordCtrl = function ($http, $window, toaster, $sce) {
        const ctrl = this;

        ctrl.submitForgotPassword = function () {
            const captchaExist = typeof CaptchaSource != 'undefined' && CaptchaSource != null;
            const captchaInstanceId = captchaExist ? CaptchaSource.InstanceId : null;

            $http
                .post('account/forgotPasswordJson', {
                    email: ctrl.email,
                    captchaCode: ctrl.captchaCode,
                    captchaSource: captchaInstanceId,
                })
                .then((response) => {
                    const data = response.data;
                    if (data.result == true) {
                        ctrl.emailSent = true;
                    } else {
                        toaster.error(data.error);
                        if (data.obj.ShowCaptcha && !ctrl.showCaptcha) {
                            ctrl.showCaptcha = true;
                            ctrl.initCaptcha('forgotPassword.captchaCode').then((data) => {
                                ctrl.captchaHtml = data;
                            });
                        }
                        if (captchaExist) {
                            CaptchaSource.ReloadImage();
                        }
                    }
                });
        };

        ctrl.submitRecover = function () {
            const params = {
                newPassword: ctrl.newPassword,
                newPasswordConfirm: ctrl.newPasswordConfirm,
                email: ctrl.email,
                hash: ctrl.hash,
            };

            $http.post('account/changePasswordJson', params).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    ctrl.passwordChanged = true;
                } else {
                    toaster.error(data.errors.join('<br>'));
                }
            });
        };

        ctrl.initCaptcha = function (ngModel) {
            return $http.post('../commonExt/getCaptchaHtml', { ngModel }).then((response) => $sce.trustAsHtml(response.data));
        };
    };

    ForgotPasswordCtrl.$inject = ['$http', '$window', 'toaster', '$sce'];

    ng.module('forgotPassword', []).controller('ForgotPasswordCtrl', ForgotPasswordCtrl);
})(window.angular);
