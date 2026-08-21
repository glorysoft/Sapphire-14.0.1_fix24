(function (ng) {
    

    const ModalExportProductsCtrl = function ($uibModalInstance) {
        const ctrl = this;

        ctrl.$onInit = function () {};

        ctrl.close = function (notCheck) {
            $uibModalInstance.dismiss({ notCheck });
        };
    };

    ModalExportProductsCtrl.$inject = ['$uibModalInstance'];

    ng.module('uiModal').controller('ModalExportProductsCtrl', ModalExportProductsCtrl);
})(window.angular);
