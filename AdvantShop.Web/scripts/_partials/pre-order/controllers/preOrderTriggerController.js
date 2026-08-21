/* @ngInject */
function PreOrderTriggerCtrl($window, toaster, preOrderService) {
    const ctrl = this;

    ctrl.formInit = function (form) {
        ctrl.form = form;
    };

    ctrl.modalCallbackClose = function (modalScope) {
        preOrderService.modalCallbackClose(ctrl.form);
    };

    ctrl.successFn = function (result) {
        preOrderService.successFn(result, ctrl.modalId);
    };
}

export default PreOrderTriggerCtrl;
