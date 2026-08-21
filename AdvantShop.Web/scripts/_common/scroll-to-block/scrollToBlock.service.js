/* @ngInject */
export const scrollToBlockService = function ($window, scrollToBlockConfig) {
    // eslint-disable-next-line no-invalid-this
    const service = this;
    const scrollendSupport = 'onscrollend' in $window;
    service.scrollToBlock = (
        el,
        options = { smooth: true, offsetTop: 0, scrollParentElement: null },
        onStartScroll = undefined,
        onEndScroll = undefined,
    ) => {
        const elCoords = el.getBoundingClientRect();
        const scrollParentElement = options.scrollParentElement ?? $window;
        const isWindow = scrollParentElement === window;
        const elCoordsTopWithScroll = elCoords.top + (isWindow && window.pageYOffset);
        const standardValue = elCoordsTopWithScroll - (options.offsetTop ?? 0);
        const numberScrollToEl =
            typeof scrollToBlockConfig.calcExtend !== 'undefined'
                ? scrollToBlockConfig.calcExtend(standardValue, {
                      top: elCoords.top + (isWindow && window.pageYOffset),
                      left: elCoords.left,
                      right: elCoords.right,
                      bottom: elCoords.bottom,
                      width: elCoords.width,
                      height: elCoords.height,
                  })
                : standardValue;

        if (typeof onStartScroll !== 'undefined') {
            onStartScroll();
        }

        if (typeof onEndScroll !== 'undefined') {
            if (scrollendSupport) {
                scrollParentElement.addEventListener('scrollend', function scrollendCallback() {
                    scrollParentElement.removeEventListener('scrollend', scrollendCallback);
                    onEndScroll();
                });
            } else {
                let timerId;
                scrollParentElement.addEventListener('scroll', function scrollendCallback() {
                    if (typeof timerId !== 'undefined') {
                        clearTimeout(timerId);
                    }

                    timerId = setTimeout(() => {
                        scrollParentElement.removeEventListener('scroll', scrollendCallback);
                        onEndScroll();
                    }, 300);
                });
            }
        }

        scrollParentElement.scrollTo({
            top: Math.round(numberScrollToEl),
            behavior: options.smooth !== false ? 'smooth' : 'auto',
        });
    };
};
