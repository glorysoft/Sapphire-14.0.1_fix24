import formTemplate from '../templates/preOrderForm.html';
/* @ngInject */
function preOrderTriggerDirective(preOrderService) {
    return {
        restrict: 'A',
        scope: true,
        controller: 'PreOrderTriggerCtrl',
        controllerAs: 'preOrderTrigger',
        bindToController: true,
        link (scope, element, attrs, ctrl) {
            element.on('click', (event) => {
                event.preventDefault();

                const modalId = element[0].getAttribute('data-pre-order-modal');

                ctrl.modalId = modalId != null ? modalId : 'modalPreOrder';

                scope.$apply(() => {
                    preOrderService.showDialog(ctrl.modalId);
                });
            });
        },
    };
}

function preOrderFormDirective() {
    return {
        restrict: 'A',
        scope: {
            offerId: '=?',
            productId: '=?',
            formInit: '&',
            successFn: '&',
            preOrderValid: '&',
            amount: '=?',
            jsonHash: '=?',
            isLanding: '=',
        },
        controller: 'PreOrderFormCtrl',
        controllerAs: 'preOrderForm',
        bindToController: true,
        templateUrl: formTemplate,
    };
}

export { preOrderTriggerDirective, preOrderFormDirective };
