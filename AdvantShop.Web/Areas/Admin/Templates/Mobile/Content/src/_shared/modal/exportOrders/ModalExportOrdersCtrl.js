(function (ng) {
    

    const ModalExportOrdersCtrl = function ($uibModalInstance) {
        const ctrl = this;

        ctrl.$onInit = function () {};

        ctrl.close = function (notCheck) {
            $uibModalInstance.dismiss({ notCheck });
        };
    };

    ModalExportOrdersCtrl.$inject = ['$uibModalInstance'];

    ng.module('uiModal').controller('ModalExportOrdersCtrl', ModalExportOrdersCtrl);
})(window.angular);
