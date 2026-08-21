import popoverTemplate from '../templates/popover.html';
/* @ngInject */
function popoverControlDirective(popoverConfig) {
    return {
        restrict: 'A',
        scope: {
            popoverId: '@',
            popoverTrigger: '@',
            popoverTriggerHide: '@',
            popoverOnOpen: '<?',
            popoverOnClose: '<?',
        },
        transclude: true,
        controller: 'PopoverControlCtrl',
        controllerAs: 'popoverControl',
        bindToController: true,
        template (_element, attrs) {
            const trigger = attrs.popoverTrigger || popoverConfig.popoverTrigger;
            const triggerHide = attrs.popoverTriggerHide || popoverConfig.popoverTriggerHide;
            const ngTrigger =
                trigger !== triggerHide ? `data-ng-${  trigger  }="popoverControl.active()"` : `data-ng-${  trigger  }="popoverControl.toggle()"`;
            const ngTriggerHide = trigger !== triggerHide ? `data-ng-${  triggerHide  }="popoverControl.deactive()"` : '';

            return ['<span data-ng-transclude', ' ', ngTrigger, ' ', ngTriggerHide, '></span>'].join('');
        },
    };
}

/* @ngInject */
function popoverDirective(popoverService, popoverConfig) {
    return {
        restrict: 'A',
        scope: {
            id: '@',
            popoverShowOnLoad: '&',
            popoverOverlayEnabled: '&',
            popoverPosition: '@',
            popoverIsFixed: '&',
            popoverIsCanHover: '&',
            popoverShowOne: '<?',
            popoverShowDelay: '<?',
            popoverShowCross: '<?',
            popoverOnOpen: '<?',
            popoverOnClose: '<?',
            popoverCustomStyles: '<?',
        },
        transclude: true,
        replace: true,
        templateUrl: popoverTemplate,
        controller: 'PopoverCtrl',
        controllerAs: 'popover',
        bindToController: true,
        link (_scope, _element, _attrs, ctrl) {
            ctrl.popoverPosition ||= popoverConfig.popoverPosition;

            if (ctrl.popoverShowOnLoad === true) {
                popoverService.getControl(ctrl.id).then(ctrl.active);
            }
        },
    };
}

function popoverOverlayDirective() {
    return {
        restrict: 'A',
        scope: {},
        replace: true,
        template:
            '<div class="adv-popover-overlay" data-ng-show="popoverOverlay.isVisibleOverlay" data-ng-click="popoverOverlay.overlayHide()"></div>',
        controller: 'PopoverOverlayCtrl',
        controllerAs: 'popoverOverlay',
        bindToController: true,
    };
}

export { popoverControlDirective, popoverDirective, popoverOverlayDirective };
