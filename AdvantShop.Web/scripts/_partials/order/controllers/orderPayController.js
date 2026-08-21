/* @ngInject */
function OrderPayCtrl() {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.rnd = Math.random();
    };

    ctrl.refresh = function () {
        ctrl.rnd = Math.random();
    };
}
export default OrderPayCtrl;
