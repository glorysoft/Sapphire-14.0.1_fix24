(function (ng) {
    const scrollToBlockService = function ($window, transformerService) {
        const service = this;

        service.scrollToBlock = (el, smooth) => {
            const elCoords = el.getBoundingClientRect();
            const elCoordsTopWithScroll = elCoords.top + window.pageYOffset;
            const transformersList = transformerService.getTransformersStorage();
            const transfomersNeedHeight = transformersList.reduce((acc, it) => {
                if (it._elementStartRect.topWithScroll < elCoordsTopWithScroll) {
                    return acc + it.getHeightElement();
                }
                return acc;
            }, 0);
            const numberScrollToEl = elCoordsTopWithScroll - transfomersNeedHeight;
            $window.scrollTo({
                top: Math.round(numberScrollToEl),
                behavior: smooth ? 'smooth' : 'auto',
            });
            const correctScroll = (attempt) => {
                if (attempt > 2) return;
                setTimeout(() => {
                    const correctedTop = Math.round(el.getBoundingClientRect().top + window.pageYOffset - transfomersNeedHeight);
                    if (Math.abs(correctedTop - Math.round(numberScrollToEl)) > 2) {
                        $window.scrollTo({ top: correctedTop, behavior: 'smooth' });
                        correctScroll(attempt + 1);
                    }
                }, 500);
            };
            correctScroll(0);
        };

        service.nextUntil = function (elem, selector, filter) {
            elem = elem.nextElementSibling;
            while (elem) {
                if (elem.matches(selector)) break;
                if (filter && !elem.matches(filter)) {
                    elem = elem.nextElementSibling;
                    continue;
                }
                elem = elem.nextElementSibling;
            }
            return elem;
        };
    };

    scrollToBlockService.$inject = ['$window', 'transformerService'];

    angular.module('scrollToBlock').service('scrollToBlockService', scrollToBlockService);
})(window.angular);
