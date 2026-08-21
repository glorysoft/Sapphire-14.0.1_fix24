const wrap = (fn, timeout) => {
    if (timeout != null) {
        setTimeout(() => fn(), timeout);
    } else {
        fn();
    }
};
export const scrollToBlockDirective = /* @ngInject */ ($parse, scrollToBlockService, scrollToBlockConfig) => ({
        restrict: 'AE',
        require: ['scrollToBlock', '?^scrollSpy'],
        controller () {},
        controllerAs: 'scrollToBlock',
        scope: true,
        link (scope, element, attrs, ctrlList) {
            const el = element[0],
                scrollSpyCtrl = ctrlList[1],
                onClick = attrs.scrollToBlockOnClick != null ? $parse(attrs.scrollToBlockOnClick) : null,
                onStartScroll = attrs.scrollToBlockOnStart != null ? $parse(attrs.scrollToBlockOnStart) : null,
                onEndScroll = attrs.scrollToBlockOnEnd != null ? $parse(attrs.scrollToBlockOnEnd) : null,
                triggerOptions = attrs.scrollToBlockOptions != null ? $parse(attrs.scrollToBlockOptions)(scope) : null;

            const onClickWrap = () => {
                if (scrollSpyCtrl) {
                    scrollSpyCtrl.setActive();
                }
                if (onClick != null) {
                    onClick(scope, { $event: event });
                }
            };

            const onStartScrollWrap = () => {
                if (scrollSpyCtrl) {
                    scrollSpyCtrl.deactivate();
                }
                if (onStartScroll != null) {
                    onStartScroll(scope);
                }
            };

            const onEndScrollWrap = () => {
                if (scrollSpyCtrl) {
                    scrollSpyCtrl.activate();
                }

                if (onEndScroll != null) {
                    onEndScroll(scope);
                }
            };

            el.addEventListener('click', (event) => {
                const selector = attrs.scrollToBlock || attrs.href;
                const block = document.querySelector(selector);
                if (block == null) {
                    return;
                }

                wrap(() => {
                    const options = {
                        
                        ...scrollToBlockConfig,
                        ...attrs.scrollToBlockOptions != null && $parse(attrs.scrollToBlockOptions)(scope),
                    };
                    event.preventDefault();
                    scrollToBlockService.scrollToBlock(block, options || {}, onStartScrollWrap, onEndScrollWrap);

                    onClickWrap();

                    scope.$apply();
                }, triggerOptions?.delay);
            });
        },
    });
