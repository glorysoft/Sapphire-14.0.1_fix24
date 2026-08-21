(function (ng) {
    

    const ModalCertificateSettingsCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.getCertificate();
        };

        ctrl.getCertificate = function () {
            $http.get('certificates/getSettings').then((response) => {
                ctrl.settings = response.data;
                ctrl.settings.Tax = `${ctrl.settings.Tax  }`; //toString
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            ctrl.btnSleep = true;

            const params = ctrl.settings;
            $http.post('certificates/saveSettings', params).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Certificates.ChangesSaved'));
                    $uibModalInstance.close();
                } else {
                    toaster.pop('error', '', $translate.instant('Admin.Js.Certificates.ErrorWhileSaving'));
                }
                ctrl.btnSleep = false;
            });
        };
    };

    ModalCertificateSettingsCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalCertificateSettingsCtrl', ModalCertificateSettingsCtrl);
})(window.angular);
