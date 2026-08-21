(function (ng) {
    

    const ResultPriceRegulationCtrl = function ($uibModalInstance) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;

            ctrl.title = params.title;
            ctrl.msg = params.msg;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ResultPriceRegulationCtrl.$inject = ['$uibModalInstance'];

    ng.module('uiModal').controller('ResultPriceRegulationCtrl', ResultPriceRegulationCtrl);
})(window.angular);
