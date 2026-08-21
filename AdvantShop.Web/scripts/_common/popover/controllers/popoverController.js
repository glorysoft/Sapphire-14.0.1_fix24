/* @ngInject */
function PopoverCtrl($q, $element, $window, $timeout, popoverService, popoverConfig) {
    const ctrl = this;

    ctrl.$onInit = function () {
        const popoverShowOnLoad = ctrl.popoverShowOnLoad(),
            popoverOverlayEnabled = ctrl.popoverOverlayEnabled(),
            popoverIsFixed = ctrl.popoverIsFixed(),
            popoverIsCanHover = ctrl.popoverIsCanHover();

        ctrl.popoverShowOnLoad = popoverShowOnLoad ? popoverShowOnLoad : popoverConfig.popoverShowOnLoad;
        ctrl.popoverOverlayEnabled = popoverOverlayEnabled  ? popoverOverlayEnabled : popoverConfig.popoverOverlayEnabled;
        ctrl.popoverIsFixed = popoverShowOnLoad ? popoverIsFixed : popoverConfig.popoverIsFixed;
        ctrl.popoverIsCanHover = popoverIsCanHover ? popoverIsCanHover : popoverConfig.popoverIsCanHover;
        ctrl.popoverShowOne = ctrl.popoverShowOne ? ctrl.popoverShowOne : popoverConfig.popoverShowOne;
        ctrl.popoverShowDelay = ctrl.popoverShowDelay  ? ctrl.popoverShowDelay : popoverConfig.popoverShowDelay;
        ctrl.popoverShowCross = ctrl.popoverShowCross ? ctrl.popoverShowCross : popoverConfig.popoverShowCross;

        popoverService.addStorage(ctrl.id, ctrl);
    };

    ctrl.updatePosition = function (targetElement) {
        ctrl.position = popoverService.getPosition($element[0], targetElement || ctrl.controlElement[0], ctrl.popoverPosition, ctrl.popoverIsFixed);
    };

    ctrl.active = function (targetElement) {
        if (ctrl.popoverShowOne === true && $window.localStorage.getItem(ctrl.id)) {
            return $q.resolve('Popover show is one');
        }
        return $timeout(() => {
            ctrl.popoverIsShow = true;
            $element[0].classList.add('active');
            if (!ctrl.popoverCustomStyles) {
                ctrl.updatePosition(targetElement);
                ctrl.popoverPosition = ctrl.position.position;
            }

            if (ctrl.popoverOverlayEnabled === true) {
                popoverService.showOverlay(ctrl.id);
            }
            if (ctrl.popoverOnOpen) {
                ctrl.popoverOnOpen();
            }
        }, ctrl.popoverShowDelay);
    };

    ctrl.deactive = function () {
        ctrl.popoverIsShow = false;
        $element[0].classList.remove('active');
        if (ctrl.popoverShowOne === true) {
            $window.localStorage.setItem(ctrl.id, true);
        }

        if (ctrl.popoverOverlayEnabled === true) {
            popoverService.getPopoverOverlay().then((overlayScope) => {
                overlayScope.overlayHide();
            });
        }

        if (ctrl.popoverOnClose) {
            ctrl.popoverOnClose();
        }
    };

    ctrl.toggle = function () {
        if (ctrl.popoverIsShow === true) {
            ctrl.deactive();
        } else {
            ctrl.active();
        }
    };

    ctrl.getClasses = function () {
        const result = [];

        result.push(`adv-popover-position-${  ctrl.popoverPosition}`);

        if (ctrl.popoverIsFixed === true) {
            result.push('adv-popover-fixed');
        }

        return result;
    };
}

export default PopoverCtrl;
