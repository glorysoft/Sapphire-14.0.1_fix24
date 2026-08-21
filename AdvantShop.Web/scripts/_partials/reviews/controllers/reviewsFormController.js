/* @ngInject */
function ReviewsFormCtrl($timeout, toaster, $translate, $http, $q) {
    const ctrl = this;

    ctrl.nameFocus = ctrl.emailFocus = ctrl.textFocus = false;
    ctrl.images = [];

    ctrl.selectedImage = function (files) {
        if (files && files.length) {
            for (let i = 0; i < files.length; i++) {
                ctrl.pushImages(files[i]);
            }
        }
    };

    ctrl.pushImages = function (image) {
        ctrl.images.push(image || {});
    };

    ctrl.deleteImage = function (index) {
        ctrl.images.splice(index, 1);
    };

    ctrl.submit = function () {
        ctrl.btnSend = true;
        if (ctrl.isShowUserAgreementText && !ctrl.agreement) {
            toaster.pop('error', $translate.instant('Js.Subscribe.ErrorAgreement'));
            ctrl.btnSend = false;
            return;
        }

        ctrl.images = ctrl.images.filter((image) => image.name);

        const defer = $q.defer();
        if (typeof CaptchaSource !== 'undefined') {
            CaptchaSource.InputId = 'CaptchaCode';

            ctrl.captchaCode = CaptchaSource.GetInputElement().value;
            ctrl.captchaSource = CaptchaSource.InstanceId;

            $http.get(`${CaptchaSource.ValidationUrl  }&i=${  CaptchaSource.GetInputElement().value}`).then((result) => {
                if (result.data === true) {
                    $timeout(() => {
                        CaptchaSource.ReloadImage();
                    }, 1000);
                    CaptchaSource.GetInputElement().value = '';
                    defer.resolve();
                } else {
                    toaster.pop('error', $translate.instant('Js.Captcha.Wrong'));
                    ctrl.btnSend = false;
                    return $q.reject($translate.instant('Js.Captcha.Wrong'));
                }
            });
        } else {
            defer.resolve();
        }

        defer.promise
            .then(() => ctrl.submitFn({ form: ctrl }))
            .then(() => {
                ctrl.btnSend = false;
                if (angular.isDefined(ctrl.modalControl)) {
                    ctrl.modalControl.close();
                }
            });
    };

    ctrl.reset = function () {
        //formScope.name = '';
        //formScope.email = '';
        ctrl.text = '';
        ctrl.images = [];
        ctrl.agreement = false;
        ctrl.rating = 0;
        ctrl.currentRating = null;
        ctrl.form.$setPristine();
    };

    ctrl.setAutofocus = function () {
        ctrl.nameFocus = ctrl.emailFocus = ctrl.textFocus = false;

        $timeout(() => {
            if (ctrl.name == null || ctrl.name.length === 0) {
                ctrl.nameFocus = true;
            } else if (ctrl.email == null || ctrl.email.length === 0) {
                ctrl.emailFocus = true;
            } else if (ctrl.text == null || ctrl.text.length === 0) {
                ctrl.textFocus = true;
            }
        }, 0);
    };
}

export default ReviewsFormCtrl;
