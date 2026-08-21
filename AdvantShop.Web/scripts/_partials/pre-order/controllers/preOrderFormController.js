/* @ngInject */
function PreOrderFormCtrl($sce, $timeout, $window, preOrderService, toaster, $scope, $http) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.getFormData();
        if (ctrl.formInit != null) {
            ctrl.formInit({ form: ctrl });
        }
    };

    ctrl.getFormData = function () {
        return preOrderService.getFormData().then((responseData) => {
            ctrl.data = responseData.data;
            ctrl.field = responseData.field;
            if (ctrl.field.EnableCaptchaInPreOrder) {
                ctrl.initCaptcha('preOrderForm.captchaCode').then((data) => {
                    ctrl.captchaHtml = data;
                });
            }
            return ctrl.data;
        });
    };

    ctrl.reset = function () {
        ctrl.data.FirstName = '';
        ctrl.data.LastName = '';
        ctrl.data.Email = '';
        ctrl.data.Phone = '';
        ctrl.data.Comment = '';

        ctrl.form.$setPristine();
    };

    ctrl.send = function () {
        const isValid = ctrl.preOrderValid();

        if (isValid === true || isValid == null) {
            ctrl.process = true;

            const captchaExist = typeof CaptchaSourcePreOrder != 'undefined' && CaptchaSourcePreOrder != null;
            const captchaInstanceId = captchaExist ? CaptchaSourcePreOrder.InstanceId : null;
            ctrl.data.OfferId = ctrl.offerId;
            ctrl.data.ProductId = ctrl.productId;
            ctrl.data.Amount = ctrl.amount;
            ctrl.data.OptionsHash = ctrl.jsonHash;
            ctrl.data.IsLanding = ctrl.isLanding;
            ctrl.data.CaptchaCode = ctrl.captchaCode;
            ctrl.data.CaptchaSource = captchaInstanceId;
            preOrderService.send(ctrl.data).then((data) => {
                if (data.result === true) {
                    ctrl.result = data.obj;

                    ctrl.successFn({ result: ctrl.result });

                    if (ctrl.autoReset != null) {
                        $timeout(ctrl.reset, ctrl.autoReset);
                    }
                } else if (data.errors && data.errors.length) {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });
                    ctrl.captchaCode = null;
                } else {
                    toaster.pop('error', 'Ошибка при отправке');
                    ctrl.captchaCode = null;
                }
                if (captchaExist) {
                    CaptchaSourcePreOrder.ReloadImage();
                }

                ctrl.process = false;
            });
        }
    };

    ctrl.initCaptcha = function (ngModel) {
        return $http.post('/commonExt/getCaptchaHtml', { ngModel, captchaId: 'CaptchaSourcePreOrder' }).then((response) => $sce.trustAsHtml(response.data));
    };
}

export default PreOrderFormCtrl;
