(function (ng) {
    

    const CmStatCTrl = function CmStatCTrl(cmStatService) {
        const ctrl = this;

        ctrl.$onInit = function $onInit() {
            ctrl.entity = cmStatService.getData();
        };

        ctrl.$onDestroy = function $onDestroy() {
            cmStatService.deleteObsevarable();
        };

        ctrl.deleteObsevarable = function () {
            cmStatService.deleteObsevarable();
        };
    };

    CmStatCTrl.$inject = ['cmStatService'];

    ng.module('cmStat', []).controller('CmStatCTrl', CmStatCTrl);
})(window.angular);
