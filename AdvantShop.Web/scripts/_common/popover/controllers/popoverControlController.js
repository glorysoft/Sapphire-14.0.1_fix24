/* @ngInject */
function PopoverControlCtrl($element, popoverService) {
    const ctrl = this;
    let popoverScope;

    ctrl.$onInit = function() {
        popoverService
            .getPopoverScope(ctrl.popoverId)
            .then(() => popoverService.addControl(ctrl.popoverId, $element[0]))
            .then((result) => {
                popoverScope = result;
            });
    };

    ctrl.active = function() {
        if (popoverScope) {
            popoverScope.active($element[0]);
        }
    };

    ctrl.deactive = function() {
        if (popoverScope) {
            popoverScope.deactive();
        }
    };

    ctrl.toggle = function() {
        if (popoverScope) {
            popoverScope.toggle();
        }
    };
}

export default PopoverControlCtrl;
