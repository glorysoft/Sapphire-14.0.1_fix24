import checkOrderTemplate from '../templates/checkOrder.html';

/* @ngInject */
function CheckOrderCtrl($controller, modalService) {
    const ctrl = this;

    ctrl.checkOrderSubmit = function (orderNumber) {
        modalService.renderModal(
            'modalCheckOrder',
            'Статус заказа',
            `<div ng-include="'${checkOrderTemplate}'"></div>`,
            null,
            {
                destroyOnClose: true,
                isOpen: true,
                modalClass: 'checkorder-modal',
            },
            {
                checkOrderModal: $controller('CheckOrderModalCtrl', { checkOrderData: { orderNumber } }),
            },
        );
    };
}

export default CheckOrderCtrl;
