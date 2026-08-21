/* @ngInject */
function InplacePriceButtonsCtrl($element, inplaceService, $window, $document) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.inplacePrice = inplaceService.getInplacePrice(ctrl.inplacePriceButtons);
        ctrl.inplacePrice.buttons = {
            element: $element,
            ctrl,
        };

        if (ctrl.onInit) {
            ctrl.onInit({ callback: ctrl.calcAndSetPositionButtons });
        }
    };

    ctrl.$postLink = function () {
        ctrl.calcAndSetPositionButtons();
    };

    ctrl.calcAndSetPositionButtons = function () {
        const triggerElementRect = ctrl.inplacePrice.elementTrigger.getBoundingClientRect();
        $element.css({
            top: $window.pageYOffset + triggerElementRect.bottom,
            right: $document[0].body.clientWidth - triggerElementRect.right,
        });
    };

    ctrl.btnSave = function () {
        ctrl.inplacePrice.clickedButtons = true;
        ctrl.inplacePrice.save();
    };

    ctrl.btnCancel = function () {
        ctrl.inplacePrice.clickedButtons = true;
        ctrl.inplacePrice.cancel();
    };
}

export default InplacePriceButtonsCtrl;
