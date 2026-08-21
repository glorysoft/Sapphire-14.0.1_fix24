(function (ng) {
    

    const HelpTriggerCtrl = function ($scope, $document, $element, domService, helpTriggerService, isMobileService) {
        let ctrl = this,
            scrollTimer,
            scrollableContainer,
            popover,
            isTriggerHover = false,
            isPopoverHover = false;

        ctrl.$onInit = function () {
            ctrl.isMobile = isMobileService.getValue();
        };

        ctrl.mouseenter = function () {
            isTriggerHover = true;

            setTimeout(() => {
                if (isTriggerHover === false) {
                    return;
                }

                const activeHelpTrigger = helpTriggerService.getActiveHelpTrigger();

                if (activeHelpTrigger != null) {
                    activeHelpTrigger.close();
                }

                helpTriggerService.addActiveHelpTrigger(ctrl);

                ctrl.open();

                if (scrollableContainer == null) {
                    scrollableContainer = domService.getScrollableParent($element[0]);
                }

                scrollableContainer.addEventListener('scroll', scroll);

                setTimeout(() => {
                    popover = $document[0].querySelector(`.${  ctrl.innerPopoverContentClass}`);
                    bindPopover(popover);
                    $document[0].addEventListener('mousemove', checkInHover);
                }, 100);

                $scope.$digest();
            }, 300);
        };

        ctrl.mouseleave = function () {
            isTriggerHover = false;
        };

        ctrl.close = function () {
            ctrl.isOpen = false;
            $document[0].removeEventListener('mousemove', checkInHover);
            scrollableContainer.removeEventListener('scroll', scroll);
            unbindPopover();
            helpTriggerService.clearActiveHelpTrigger(ctrl);
            popover = null;
            scrollableContainer = null;
        };

        ctrl.open = function () {
            ctrl.isOpen = true;
        };
        function bindPopover(popover) {
            if (popover != null) {
                popover.addEventListener('mouseenter', popoverMouseEnter);
                popover.addEventListener('mouseleave', popoverMouseLeave);
            }
        }

        function unbindPopover(popover) {
            if (popover != null) {
                popover.removeEventListener('mouseenter', popoverMouseEnter);
                popover.removeEventListener('mouseleave', popoverMouseLeave);
            }
        }

        function popoverMouseEnter() {
            isPopoverHover = true;
        }

        function popoverMouseLeave() {
            isPopoverHover = false;
        }

        function scroll(e) {
            if (scrollTimer != null) {
                clearTimeout(scrollTimer);
            }

            scrollTimer = setTimeout(() => {
                checkInHover(e);
            }, 100);
        }

        function checkInHover(e) {
            if (popover != null && isPopoverHover === false) {
                const mouseLoc = { x: e.x, y: e.y };
                const triggerRect = helpTriggerService.getContainerRect($element[0], scrollableContainer);
                const popoverRect = helpTriggerService.getContainerRect(popover, scrollableContainer);
                const options = { tolerance: 10 };

                if (helpTriggerService.checkInTriangle(triggerRect, popoverRect, mouseLoc, options) === false) {
                    ctrl.close();
                    $scope.$digest();
                }
            }
        }
    };

    HelpTriggerCtrl.$inject = ['$scope', '$document', '$element', 'domService', 'helpTriggerService', 'isMobileService'];

    ng.module('helpTrigger', []).controller('HelpTriggerCtrl', HelpTriggerCtrl);
})(window.angular);
