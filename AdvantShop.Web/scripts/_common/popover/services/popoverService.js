/* @ngInject */
function popoverService($cacheFactory, $q, $rootScope, $compile, $window, $document) {
    // eslint-disable-next-line no-invalid-this
    const service = this,
        cache = $cacheFactory('cachePopover'),
        defersPopover = {},
        defersPopoverControl = {},
        tileTriangle = 8;
    let deferOverlay,
        tileSize;

    service.addStorage = function(popoverId, obj) {
        const item = cache.get(popoverId);
        let objForSave = {};

        if (item) {
            angular.extend(objForSave, item, obj);
        } else {
            objForSave = obj;
        }

        const popover = cache.put(popoverId, objForSave);

        if (defersPopover[popoverId]) {
            defersPopover[popoverId].resolve(popover);
        }

        return popover;
    };

    service.addControl = function(popoverId, control) {
        return service.getPopoverScope(popoverId).then((popoverScope) => {
            popoverScope.controlElement = control;

            if (defersPopoverControl[popoverId]) {
                defersPopoverControl[popoverId].resolve(control);
            }
            return popoverScope;
        });
    };

    service.getControl = function(popoverId) {
        return service.getPopoverScope(popoverId).then((popoverScope) => {
            const defer = $q.defer();

            if (!popoverScope.controlElement) {
                defersPopoverControl[popoverId] = defer;
            } else {
                defer.resolve(popoverScope.controlElement);
            }

            return defer.promise;
        });
    };

    service.getPopoverScope = function(popoverId) {
        const popover = cache.get(popoverId),
            defer = $q.defer(),
            { promise } = defer;

        if (!popover) {
            defersPopover[popoverId] = defer;
        } else {
            defer.resolve(popover);
        }

        return promise;
    };

    service.addPopoverOverlay = function(overlayScope) {
        service.addStorage('popoverOverlay', overlayScope);
        if (deferOverlay) {
            deferOverlay.resolve(overlayScope);
        }
    };

    service.getPopoverOverlay = function() {
        const overlay = cache.get('popoverOverlay'),
            defer = $q.defer(),
            { promise } = defer;

        if (!overlay) {
            deferOverlay = defer;
            service.renderOverlay();
        } else {
            defer.resolve(overlay);
        }

        return promise;
    };

    service.showOverlay = function(popoverId) {
        return service.getPopoverOverlay().then((overlayScope) => {
            overlayScope.isVisibleOverlay = true;
            overlayScope.popoverId = popoverId;
            return overlayScope;
        });
    };

    service.renderOverlay = function() {
        const overlay = angular.element('<div class="popover-overlay" data-popover-overlay></div>');

        $document[0].body.appendChild(overlay[0]);

        $compile(overlay)($rootScope.$new(true));
    };

    // eslint-disable-next-line complexity
    service.getPosition = function(popoverElement, popoverControlElement, position, isFixed) {

        const popoverControlSize = {
            width: popoverControlElement.offsetWidth,
            height: popoverControlElement.offsetHeight,
        };

        const popoverControlPos = {
            top: popoverControlElement.offsetTop,
            left: popoverControlElement.offsetLeft,
        };

        const controlRect = popoverControlElement.getBoundingClientRect();

        const popoverControlPosAbs = {
            top: controlRect.top,
            bottom: controlRect.bottom,
            left: controlRect.left,
            right: controlRect.right,
            width: controlRect.width,
        };

        if (!(controlRect.top >= 0 && controlRect.bottom <= (window.innerHeight || document.documentElement.clientHeight))) {
            popoverControlPosAbs.top += $window.pageYOffset;
            popoverControlPosAbs.bottom += $window.pageYOffset;
        }

        const popoverSize = {
            width: popoverElement.offsetWidth,
            height: popoverElement.offsetHeight,
        };

        const pos = {
            top: 0,
            left: 0,
            leftTile: 0,
            position,
        };

        const positionData = isFixed === true ? popoverControlPosAbs : popoverControlPos;

        switch (position) {
            case 'top':
                tileSize ||= popoverElement.querySelector('.js-popover-tile').offsetHeight; //5 - для нахлеста
                pos.top = positionData.top - popoverSize.height - tileSize;
                pos.left = positionData.left + (popoverControlSize.width - popoverSize.width) / 2;
                break;
            case 'right':
                tileSize ||= popoverElement.querySelector('.js-popover-tile').offsetWidth + tileTriangle; //5 - для нахлеста
                pos.top = positionData.top + (popoverControlSize.height - popoverSize.height) / 2;
                pos.left = positionData.left + popoverControlSize.width + tileSize;
                break;
            case 'bottom':
                tileSize ||= popoverElement.querySelector('.js-popover-tile').offsetHeight; //5 - для нахлеста
                pos.top = positionData.top + popoverControlSize.height + tileSize;
                pos.left = positionData.left + (popoverControlSize.width - popoverSize.width) / 2;
                break;
            case 'left':
                tileSize ||= popoverElement.querySelector('.js-popover-tile').offsetWidth + tileTriangle; //5 - для нахлеста
                pos.top = positionData.top + (popoverControlSize.height - popoverSize.height) / 2;

                if (isFixed === true) {
                    pos.left = positionData.left - popoverSize.width;
                } else {
                    pos.left = 'auto';
                    pos.right = '100%';
                }

                if (popoverControlPosAbs.left <= popoverSize.width) {
                    tileSize ||= popoverElement.querySelector('.js-popover-tile').offsetWidth + tileTriangle; //5 - для нахлеста
                    pos.left = positionData.left + popoverControlSize.width + tileSize;
                    pos.position = 'right';
                    pos.right = 'auto';
                }
                break;
            case 'topleft':
                tileSize ||= popoverElement.querySelector('.js-popover-tile').offsetHeight; //5 - для нахлеста
                pos.top = positionData.top - popoverSize.height - tileSize;
                if (isFixed === true) {
                    pos.left = positionData.left - popoverSize.width + positionData.width;
                } else {
                    pos.left = 'auto';
                    pos.right = '100%';
                }
                if (popoverControlPosAbs.left <= popoverSize.width) {
                    tileSize ||= popoverElement.querySelector('.js-popover-tile').offsetWidth + tileTriangle; //5 - для нахлеста
                    pos.left = positionData.left + popoverControlSize.width + tileSize;
                    pos.position = 'right';
                    pos.right = 'auto';
                }
                pos.leftTile = popoverSize.width - positionData.width / 2 - tileSize / 2;
                break;
            default:
                throw new Error(`Not register position:${position}`);
        }

        return pos;
    };
}

export default popoverService;
