/* @ngInject */
function CheckOrderModalCtrl(checkOrderService, checkOrderData) {
    const ctrl = this;

    ctrl.isLoaded = false;
    ctrl.historyCountVisible = 5;

    checkOrderService
        .getStatus(checkOrderData.orderNumber)
        .then((status) => {
            ctrl.data = status;
        })
        .finally(() => {
            ctrl.isLoaded = true;
        });
}

export default CheckOrderModalCtrl;
