export const scrollSpyDirective = /* @ngInject */ ($parse, scrollSpyConfig) => ({
    restrict: 'AE',
    /* @ngInject */
    controller($attrs, $element, $scope, scrollSpyService) {
        const ctrl = this;
        let selector;
        ctrl.$postLink = () => {
            selector = $attrs.scrollSpy || $attrs.href;
            ctrl.options = {...scrollSpyConfig, ...$attrs.scrollSpyOptions && $parse($attrs.scrollSpyOptions)($scope)};

            if(ctrl.options.rootMarginShort === 'vertical-center') {
                const [topOld, rightOld, _bottomOld, leftOld] = ctrl.options.observe.rootMargin.split(' ');
                ctrl.options.observe.rootMargin = `${topOld} ${rightOld} -${window.innerHeight / 2}px ${leftOld}`;
            }

            const target = getTarget();
            if (target) {
                const dereg = scrollSpyService.addSpy($element[0], target, ctrl);
                $element.on('$destroy', () => dereg());
            }
        };

        ctrl.activate = () => scrollSpyService.activate();

        ctrl.deactivate = () => scrollSpyService.deactivate();

        ctrl.setActive = () => {
            scrollSpyService.setActive(getTarget());
        };

        const getTarget = () => document.querySelector(selector);
    },
    controllerAs: 'scrollSpy',
    scope: true,
});
