(function (ng) {
    

    const SaasStatCTrl = function SaasStatCTrl(saasStatService) {
        const ctrl = this;

        ctrl.$onInit = function $onInit() {
            ctrl.entity = saasStatService.getData();
        };

        ctrl.$onDestroy = function $onDestroy() {
            saasStatService.deleteObsevarable();
        };
    };

    SaasStatCTrl.$inject = ['saasStatService'];

    ng.module('saasStat', []).controller('SaasStatCTrl', SaasStatCTrl);
})(window.angular);
