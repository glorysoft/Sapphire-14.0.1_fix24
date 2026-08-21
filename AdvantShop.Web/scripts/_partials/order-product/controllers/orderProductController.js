/* @ngInject */

function OrderProductCtrl(orderProductService) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.isLoaded = false;
        orderProductService
            .getOrderProducts()
            .then((orderPrdoducts) => {
                ctrl.items = orderPrdoducts;
            })
            .finally(() => (ctrl.isLoaded = true));
    };
}

export default OrderProductCtrl;
