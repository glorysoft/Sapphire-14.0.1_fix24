/* @ngInject */
function InplaceProgressCtrl(inplaceService) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.state = inplaceService.getProgressState();
    };
}

export default InplaceProgressCtrl;
