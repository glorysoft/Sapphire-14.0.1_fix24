function sidebarsContainerDirective() {
    return {
        controller: 'SidebarsContainerCtrl',
        controllerAs: 'sidebarContainer',
        bindToController: true,
        // scope: true
    };
}

/*@ngInject*/
function sidebarContainerCloseDirective(sidebarsContainerService) {
    return {
        require: {
            sidebarsContainer: '?^sidebarsContainer',
        },
        controller() {
        },
        controllerAs: 'sidebarContainerClose',
        bindToController: true,
        link(scope, element, attrs, ctrl) {
            element.on('click', () => {
                if (ctrl.sidebarsContainer != null) {
                    sidebarsContainerService.close();
                }
            });

            element.on('$destroy', () => {
                element.off();
            });
        },
    };
}

/* @ngInject */
function sidebarContainerOpenDirective($parse, sidebarsContainerService) {
    return {
        link(scope, element, attrs) {
            const options = attrs.sidebarContainerOpen ? $parse(attrs.sidebarContainerOpen) : null;
            element.on('click', () => {
                sidebarsContainerService.open(options(scope));
            });

            element.on('$destroy', () => {
                element.off();
            });
        },
    };
}

/* @ngInject */
function sidebarContainerToggleDirective($parse, sidebarsContainerService) {
    return {
        link(scope, element, attrs) {
            const options = attrs.sidebarContainerToggle ? $parse(attrs.sidebarContainerToggle) : null;
            element.on('click', () => {
                sidebarsContainerService.open(options(scope));
            });

            element.on('$destroy', () => {
                element.off();
            });
        },
    };
}

function sidebarContainerStateDirective() {
    return {
        controller: [
            '$attrs',
            'sidebarsContainerService',
            function($attrs, sidebarsContainerService) {
                const ctrl = this;

                ctrl.onChange = function(data, isOpen) {
                    ctrl.isOpen = isOpen;
                };

                ctrl.$onInit = function() {
                    sidebarsContainerService.addObserverState(null, $attrs.sidebarContainerState || null, ctrl.onChange);
                };
            },
        ],
        controllerAs: 'sidebarContainerState',
        bindToController: true,
    };
}

const sidebarContentStaticComponent = {
    require: {
        sidebarsContainer: '^sidebarsContainer',
    },
    bindings: {
        contentId: '@',
    },
    controller: [
        '$element',
        function($element) {
            const ctrl = this;

            ctrl.$onInit = function() {
                ctrl.sidebarsContainer.addContentStatic(ctrl.contentId, $element);
            };
        },
    ],
};

function sidebarContainerSaveDirective() {
    return {
        require: {
            sidebarsContainer: '?^sidebarsContainer',
        },
        controller() {
        },
        controllerAs: 'sidebarContainerOpen',
        template:
            '<button data-button-validation data-button-validation-success="sidebarContainerOpen.sidebarsContainer.save()" class="sidebar-container-save-btn" data-ladda="sidebarContainerOpen.sidebarsContainer.callbackInProgress" type="button"/>{{::\'Js.Builder.Save\' | translate}}</button>',
        bindToController: true,
        link(scope, element, attrs, ctrl) {
            element.on('$destroy', () => {
                element.off();
            });
        },
    };
}

/*@ngInject*/
function sidebarHookCloseDirective($parse, sidebarsContainerService) {
    return {
        require: {
            sidebarsContainer: '?^sidebarsContainer',
        },
        scope: false,
        link(scope, element, attrs) {
            const fn = $parse(attrs.sidebarHookClose);
            sidebarsContainerService.addCallback(`onClose`, () => fn(scope));
        },
    };
}

export {
    sidebarsContainerDirective,
    sidebarContainerCloseDirective,
    sidebarContainerStateDirective,
    sidebarContentStaticComponent,
    sidebarContainerSaveDirective,
    sidebarHookCloseDirective,
    sidebarContainerOpenDirective,
    sidebarContainerToggleDirective,
};
