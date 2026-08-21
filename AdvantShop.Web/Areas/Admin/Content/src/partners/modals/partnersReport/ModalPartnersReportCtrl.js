(function (ng) {
    

    const ModalPartnersReportCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.dateFrom = params.dateFrom;
            ctrl.dateTo = params.dateTo;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalPartnersReportCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalPartnersReportCtrl', ModalPartnersReportCtrl);
})(window.angular);
