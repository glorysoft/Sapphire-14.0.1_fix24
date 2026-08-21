(function (ng) {
    

    ng.module('scrollToBlock').directive('scrollToBlock', [
        '$parse',
        'scrollToBlockService',
        function ($parse, scrollToBlockService) {
            return {
                restrict: 'AE',
                controller () {},
                controllerAs: 'scrollToBlock',
                scope: true,
                link (scope, element, attrs, ctrl) {
                    let el = element[0],
                        nextEl,
                        callback = attrs.scrollToBlockCallback != null ? $parse(attrs.scrollToBlockCallback) : null;

                    el.addEventListener('click', (event) => {
                        const selector = attrs.scrollToBlock;
                        const block = document.querySelector(selector);
                        nextEl = attrs.selector != null ? scrollToBlockService.nextUntil(block, attrs.selector) : block;
                        if (nextEl != null) {
                            event.preventDefault();
                            scrollToBlockService.scrollToBlock(nextEl, true);
                            if (callback != null) {
                                callback(scope);
                            }
                        }
                    });
                },
            };
        },
    ]);
})(window.angular);
