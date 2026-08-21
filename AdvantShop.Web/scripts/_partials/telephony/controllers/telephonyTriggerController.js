(function (ng) {
    

    const TelephonyTriggerCtrl = function (telephonyService) {
        const ctrl = this;

        ctrl.dialogOpen = function (code) {
            telephonyService.dialogOpen(ctrl);
        };

        ctrl.modalCallbackClose = function () {
            ctrl.telephonyForm.reset();
            telephonyService.dialogFormReset();
        };
    };

    angular.module('telephony').controller('TelephonyTriggerCtrl', TelephonyTriggerCtrl);

    TelephonyTriggerCtrl.$inject = ['telephonyService'];
})(window.angular);
