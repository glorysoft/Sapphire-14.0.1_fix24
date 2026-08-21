(function (ng) {
    

    const domService = function ($document, $window) {
        const service = this;

        function selectorUnpackage(selector) {
            return angular.isElement(selector) && angular.isDefined(selector[0]) ? selector[0] : selector;
        }

        function check(checkList, parent) {
            return checkList.some((selectorItem) => angular.isString(selectorItem) ? service.matches(parent, selectorItem) : parent === selectorItem);
        }

        /**
         * Find parent by selector or Node instance
         * @param {string|Node} element
         * @param {string|Array|Node} selector
         * @param {string|Node} elementLimit
         */

        // TODO переделать на нативный closest
        service.closest = function (element, selector, elementLimit) {
            if (element == null) {
                return null;
            }

            element = angular.isDefined(element[0]) ? element[0] : element;

            const checkList = angular.isArray(selector) ? selector.map(selectorUnpackage) : [selectorUnpackage(selector)];

            let parent = element;

            if (parent == null) {
                return null;
            }
            if (elementLimit != null && typeof elementLimit === 'string') {
                elementLimit = service.closest(element, elementLimit);
            } else {
                elementLimit ||= document.body;
            }

            while (parent != elementLimit && parent != document && parent != null) {
                if (check(checkList, parent)) {
                    return parent;
                }

                parent = parent.parentNode;
            }

            return null;
        };

        service.prevAll = function (element) {
            let prevElement,
                result = [];

            element = angular.isDefined(element[0]) ? element[0] : element;

            prevElement = element.previousElementSibling;

            while (prevElement != null) {
                result.push(prevElement);

                prevElement = prevElement.previousElementSibling;
            }

            return result;
        };

        service.nextAll = function (element) {
            let nextElement,
                result = [];

            element = angular.isDefined(element[0]) ? element[0] : element;

            nextElement = element.nextElementSibling;

            while (nextElement != null) {
                result.push(nextElement);

                nextElement = nextElement.nextElementSibling;
            }

            return result;
        };

        service.matches = function (element, selector) {
            const fn =
                Element.prototype.matches ||
                Element.prototype.matchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector;

            return fn.call(element, selector);
        };

        service.parent = function (element, selector, elementLimit) {
            const elementNative = angular.isDefined(element[0]) ? element[0] : element;
            return elementNative.parentElement != null ? service.closest(elementNative.parentNode, selector, elementLimit) : null;
        };

        //modify variant from https://htmldom.dev/get-the-first-scrollable-parent-of-an-element
        service.isScrollable = function (ele) {
            const hasScrollableContent = ele.scrollHeight > ele.clientHeight;

            const overflowYStyle = $window.getComputedStyle(ele).overflowY;
            const isOverflowScroll = ['auto', 'scroll'].some((item) => item === overflowYStyle);

            return hasScrollableContent && isOverflowScroll;
        };

        service.getScrollableParent = function (ele) {
            return !ele || ele === $document[0].body
                ? $document[0].body
                : service.isScrollable(ele)
                  ? ele
                  : service.getScrollableParent(ele.parentNode);
        };
    };

    angular.module('dom').service('domService', ['$document', '$window', domService]);
})(window.angular);
