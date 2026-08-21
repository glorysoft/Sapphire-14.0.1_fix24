(function (ng) {
    

    const ModalAddPhoneCtrl = function ($uibModalInstance, $http, $filter, toaster, $translate, settingsTelephonyService) {
        const ctrl = this;
        ctrl.formInited = false;

        ctrl.$onInit = function () {};

        ctrl.addPhone = function () {
            settingsTelephonyService.addPhone(ctrl.newPhone, ctrl.newOrderSourceId, ctrl.$resolve.params.phoneOrderSources).then(() => {
                $uibModalInstance.close();
            });
        };

        ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalAddPhoneCtrl.$inject = ['$uibModalInstance', '$http', '$filter', 'toaster', '$translate', 'settingsTelephonyService'];

    ng.module('settingsTelephony').controller('ModalAddPhoneCtrl', ModalAddPhoneCtrl);
})(window.angular);
