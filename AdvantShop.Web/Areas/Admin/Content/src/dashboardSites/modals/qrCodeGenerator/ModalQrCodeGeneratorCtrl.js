(function (ng) {
    

    const ModalQrCodeGeneratorCtrl = function ($uibModalInstance, $http, toaster) {
        const ctrl = this;
        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            if (params) {
                ctrl.text = params.text;
                ctrl.generate();
            }
        };

        ctrl.generate = function () {
            $http
                .post('dashboard/generateQrCode', {
                    text: ctrl.text,
                })
                .then((response) => {
                    const data = response.data;
                    if (data.result) ctrl.qrCodeInBase64 = data.obj;
                    else if (data.errors)
                            data.errors.forEach((error) => {
                                toaster.pop('error', error);
                            });
                        else toaster.pop('error', 'Ошибка при генерации');
                });
        };

        ctrl.download = function () {
            const a = document.createElement('a');
            a.href = `data:image/png;base64,${  ctrl.qrCodeInBase64}`;
            a.download = 'QrCode.png';
            a.click();
            a.remove();
            $uibModalInstance.close();
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalQrCodeGeneratorCtrl.$inject = ['$uibModalInstance', '$http', 'toaster'];

    ng.module('uiModal').controller('ModalQrCodeGeneratorCtrl', ModalQrCodeGeneratorCtrl);
})(window.angular);
