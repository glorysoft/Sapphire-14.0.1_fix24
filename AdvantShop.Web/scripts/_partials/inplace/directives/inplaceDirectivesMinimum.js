/* @ngInject */
function inplaceStartDirective($window, $compile, inplaceService) {
    return {
        restrict: 'A',
        scope: {},
        link (scope) {
            const isLanding = document.documentElement.classList.contains('js-landing-page');
            const selector =
                '[data-inplace-rich], [data-inplace-modal], [data-inplace-image], [data-inplace-autocomplete], [data-inplace-properties-new], [data-inplace-price], [data-inplace-price-panel], [data-inplace-switch]';
            let mq;
            if (!isLanding) {
                mq = $window.matchMedia('(min-width: 980px)');
            }

            if (isLanding || mq?.matches) {
                init();
            }

            if (mq) {
                mq.addListener((result) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    result.matches ? init() : destroy();
                });
            }

            function init() {
                const objs = document.querySelectorAll(selector);

                if (objs?.length > 0) {
                    Array.prototype.slice.call(objs).forEach((item) => {
                        const _item = angular.element(item);
                        const _scope = _item.scope() || scope;
                        _item.addClass('inplace-initialized');
                        $compile(item)(_scope.$parent.$new());
                    });
                }
            }

            function destroy() {
                inplaceService.destroyAll();

                const objs = document.querySelectorAll(selector);

                if (objs?.length > 0) {
                    Array.prototype.slice.call(objs).forEach((item) => {
                        const _item = angular.element(item);
                        _item.removeClass('inplace-initialized');
                    });
                }
            }
        },
    };
}

function inplaceSwitchDirective() {
    return {
        restrict: 'A',
        scope: true,
        controller: 'InplaceSwitchCtrl',
        controllerAs: 'inplaceSwitch',
        bindToController: true,
    };
}

function inplaceProgressDirective() {
    return {
        restrict: 'A',
        scope: {},
        controller: 'InplaceProgressCtrl',
        controllerAs: 'inplaceProgress',
        bindToController: true,
        replace: true,
        template:
            '<div class="inplace-progress icon-spinner-before icon-animate-spin-before" data-ng-if="inplaceProgress.state.show === true"></div>',
    };
}

export { inplaceStartDirective, inplaceSwitchDirective, inplaceProgressDirective };
