(function (ng) {
    

    const ModalExportCustomersCtrl = function ($uibModalInstance) {
        const ctrl = this;

        ctrl.$onInit = function () {};

        ctrl.close = function (notCheck) {
            $uibModalInstance.dismiss({ notCheck });
        };
    };

    ModalExportCustomersCtrl.$inject = ['$uibModalInstance'];

    ng.module('uiModal').controller('ModalExportCustomersCtrl', ModalExportCustomersCtrl);
})(window.angular);
