(function(ng) {


    const SubmenuContainerCtrl = function($element, $window, $scope, windowService, submenuService, domService, $timeout) {
        let ctrl = this,
            blockOrientation,
            timeoutMove,
            timeoutLeave,
            timeoutHover,
            possiblyActivate,
            submenuShow;

        const storage = new Map();

        ctrl.active = [];

        ctrl.options = {};

        ctrl.handleEvent = function(event) {
            submenuService.addCurrentSubmenuContainer(ctrl);

            switch (event.type) {
                case 'touchstart':
                    (function(event) {
                        event.stopPropagation();

                        let submenuParentEl = domService.closest(event.target, '[data-submenu-parent]', '[data-submenu-container]'),
                            submenuParentLink = domService.closest(event.target, 'a', '[data-submenu-container]'),
                            submenuParent;

                        if (submenuParentEl != null) {
                            let record;
                            if(submenuElLimit.dataset.submenuId != null){
                                record = storage.get(submenuElLimit.dataset.submenuId);
                            }
                            if (record == null || submenuParent?.submenu == null) {
                                return;
                            }

                            if (
                                submenuParentLink != null &&
                                (submenuParent.submenu.isSubmenuVisible == false || submenuParent.submenu.isSubmenuVisible == null)
                            ) {
                                event.preventDefault();
                                submenuShow(record); //переместил так как в сафари при тапе поссыфлка ничего не происходило
                            }
                        }
                    })(event);
                    break;
                case 'mouseenter':
                    (function() {
                        submenuService.startSpyMove();

                        if (timeoutLeave != null) {
                            clearTimeout(timeoutLeave);
                        }
                    })(event);
                    break;
                case 'mouseover':
                    (function(event) {
                        if (timeoutMove != null) {
                            clearTimeout(timeoutMove);
                        }

                        if (timeoutHover != null) {
                            clearTimeout(timeoutHover);
                        }

                        timeoutHover = setTimeout(() => {
                            let submenuElLimit = domService.closest(event.target, '[data-submenu-parent]', '[data-submenu]'),
                                submenuEl = domService.closest(event.target, '[data-submenu]', submenuElLimit),
                                submenuParent;

                            //если событие было вызвано элементом в data-submenu-parent, а не в data-submenu
                            if (submenuEl == null && submenuElLimit != null) {
                                let record;
                                if(submenuElLimit.dataset.submenuId != null){
                                    record = storage.get(submenuElLimit.dataset.submenuId);
                                }

                                //if (record?.submenu != null) {
                                    possiblyActivate(record);
                                //}
                            }
                        }, ctrl.options.delayHover);
                    })(event);
                    break;
                case 'mouseleave':
                    (function(event) {
                        if (timeoutHover != null) {
                            clearTimeout(timeoutHover);
                        }

                        timeoutLeave = setTimeout(() => {
                            submenuService.stopSpyMove();

                            if (timeoutMove != null) {
                                clearTimeout(timeoutMove);
                            }
                            if(ctrl.options.hideOnLeave !== false){
                                ctrl.deactiveAll(ctrl.getBlockOrientation());
                                ctrl.getBlockOrientation().style.zIndex = 0;
                                $scope.$digest();
                            }
                        }, 350);
                    })(event);
                    break;
                default:

            }
        };

        ctrl.init = function(options) {
            ctrl.limitedViewOffsetBottomArrClasses = null;
            ctrl.container = $element[0];
            if (options.type !== 'accordion' && options.type !== 'treeview') {
                submenuShow = function(record) {
                    ctrl.getBlockOrientation().style.zIndex = 999999;

                    ctrl.deactive(record);

                    if (record.submenu != null) {
                        record.submenu.hiddenSubmenu();

                        if (options.checkOrientation === true) {
                            record.submenu.checkSubmenuOrientation(
                                ctrl.getContainerRect(),
                                record.submenu.options.verticalOrientation,
                                blockOrientation || $element[0],
                            );
                        }

                        if (record.submenu.isInit == null || record.submenu.isInit === false) {
                            setTimeout(() => {
                                record.submenu.setInitilazed();
                                record.submenu.open();
                                record.submenu.visibleSubmenu();
                                $scope.$digest();
                            });
                        } else {
                            record.submenu.open();
                            record.submenu.visibleSubmenu();
                        }
                    }

                    $scope.$digest();
                };

                possiblyActivate = function(record) {
                    let delay = 0;

                    if (record.submenu != null) {
                        delay = record.submenu.checkInTriangle(ctrl.getContainerRect());
                    }

                    if (timeoutMove != null) {
                        clearTimeout(timeoutMove);
                    }

                    if (delay) {
                        timeoutMove = setTimeout(() => {
                            possiblyActivate(record);
                        }, delay);
                    } else {
                        submenuShow(record);
                    }
                };

                $element[0].addEventListener('touchstart', ctrl.handleEvent, { passive: true });

                windowService.addCallback('touchstart', (eventObj) => {
                    const isClickedMe = domService.closest(eventObj.event.target, '[data-submenu-container]') != null;

                    if (isClickedMe === false) {
                        ctrl.deactiveAll();
                        $scope.$digest();
                    }
                });

                $element[0].addEventListener('mouseenter', ctrl.handleEvent);

                $element[0].addEventListener('mouseover', ctrl.handleEvent);

                $element[0].addEventListener('mouseleave', ctrl.handleEvent);
            }

            if (options.limitedView === true) {
                ctrl.limitedViewOffsetBottomArrClasses =
                    ctrl.options?.limitedViewOffsetBottom != null && Array.isArray(ctrl.options?.limitedViewOffsetBottom)
                        ? ctrl.options?.limitedViewOffsetBottom
                        : [];
                ctrl.limitedViewOffsetBottom = ctrl.options?.limitedViewOffsetBottom;
                setTimeout(() => {
                    ctrl.limitedVerticalView(Array.from(storage.values()));
                }, 0);
            }
        };

        ctrl.reinit = function(options) {
            $element[0].removeEventListener('touchstart', ctrl.handleEvent, { passive: true });

            $element[0].removeEventListener('mouseenter', ctrl.handleEvent);

            $element[0].removeEventListener('mouseover', ctrl.handleEvent);

            $element[0].removeEventListener('mouseleave', ctrl.handleEvent);

            ctrl.deactiveAll(ctrl.getBlockOrientation());

            if (ctrl.activeSubmenus != null && ctrl.activeSubmenus.length > 0) {
                ctrl.activeSubmenus.forEach((submenu) => {
                    submenu.close();
                });
            }

            ctrl.init(options);
        };

        ctrl.addContainerForOrientation = function(element) {
            blockOrientation = element;
        };

        ctrl.getBlockOrientation = function() {
            return blockOrientation;
        };

        ctrl.getContainerRect = function() {
            const rect = blockOrientation.getBoundingClientRect();
            ctrl.rect = {
                top: rect.top + $window.pageYOffset,
                right: rect.right + $window.pageXOffset,
                bottom: rect.bottom,
                left: rect.left,
                height: rect.height,
                width: rect.width,
            };
            return ctrl.rect;
        };

        ctrl.deactiveAll = function() {
            for (const [key, value] of storage) {
                if (value.submenu != null) {
                    value.submenu.close();
                }
            }
        };

        ctrl.deactive = function(record) {
            if(ctrl.defaultOpenFirstSubmenu){
                ctrl.defaultOpenFirstSubmenu[1].submenu?.close();
                ctrl.defaultOpenFirstSubmenu = null;
            }
            ctrl.memoryActive(record);
        };

        ctrl.showOneOnly = function(submenuParent, event) {
            let method,
                rect = submenuParent.element.getBoundingClientRect();
            ctrl.activeSubmenus = [];
            for (const [key, value] of storage) {
                if (value.submenu != null) {
                    method = value.parent === submenuParent && value.submenu.isSubmenuVisible != true ? 'open' : 'close';
                    if (method === 'open') {
                        ctrl.activeSubmenus.push(value);
                    }
                    value.submenu[method]();
                }
            }

            if (event != null) {
                setTimeout(() => {
                    const currentRect = submenuParent.element.getBoundingClientRect();

                    if (currentRect.top != rect.top && (currentRect.bottom > $window.innerHeight || currentRect.top < 0)) {
                        let scrollValue;

                        if (currentRect.top < 0) {
                            scrollValue = currentRect.top - rect.top;
                        }

                        $window.scrollBy(0, scrollValue);
                    }
                }, 0);
            }
        };

        ctrl.getOptions = function() {
            return ctrl.options;
        };

        ctrl.excludeDeactivateItems = function(record) {
            if (record.parent == null) {
                return;
            }

               const newActive = [];

            for (let i = 0, len = ctrl.active.length; i < len; i++) {
                const isFind = ctrl.findParent(ctrl.active[i].parent, record.greatParent);

                if (isFind) {
                    newActive.push(ctrl.active[i]);
                } else if (ctrl.active[i].submenu != null) {
                        ctrl.active[i].submenu.close();
                    }
            }

            ctrl.active = newActive;
        };

        ctrl.findParent = function(item, currentParent) {
            let result = false;

            if (currentParent != null) {
                if (item === currentParent) {
                    result = true;
                } else {
                    result = ctrl.findParent(item, currentParent.parent);
                }
            }

            return result;
        };

        ctrl.memoryActive = function(record) {
            ctrl.excludeDeactivateItems(record);
            ctrl.active.push(record);
        };

        ctrl.onChangeMatchMedia = function(changesOnBreakpointObj, matchesObj) {
            const changesOnBreakpoint = changesOnBreakpointObj;
            if (!matchesObj.matches && changesOnBreakpointObj.type !== ctrl.options.type) {
                ctrl.activeMatch = changesOnBreakpointObj;
                ctrl.reinit(changesOnBreakpoint);
            } else if (changesOnBreakpointObj.type !== ctrl.options.type) {
                ctrl.activeMatchString = ctrl.options.type;
                ctrl.reinit(ctrl.options);
            }

            return function(event) {
                if (!event.matches) {
                    ctrl.activeMatch = changesOnBreakpoint;
                    ctrl.reinit(changesOnBreakpoint);
                } else {
                    ctrl.activeMatch = ctrl.options;
                    ctrl.reinit(ctrl.options);
                }
            };
        };
        ctrl.limitedVerticalView = function(items) {
            const containerMenuCoords = $element[0].getBoundingClientRect();
            const viewAllBtn = $element[0].querySelector('.js-menu-dropdown-give-more-link');
            if (viewAllBtn && containerMenuCoords.bottom + $window.pageYOffset > window.innerHeight) {
                viewAllBtn.style.display = 'flex';
                const getMoreItem = $element[0].children[$element[0].children.length - 1];
                let coordsBot = containerMenuCoords.bottom + $window.pageYOffset + getMoreItem.offsetHeight;
                let count = items.length;
                const minCountItem = 7;
                const offsetBottom = ctrl.getOffsetElements(ctrl.limitedViewOffsetBottomArrClasses);
                while (coordsBot > window.innerHeight - offsetBottom && items.length - count < items.length - minCountItem) {
                    const item = items[count - 1].element;
                    coordsBot -= item.offsetHeight;
                    item.classList.add('menu-dropdown-item--hidden');
                    item.style.display = 'none';
                    count--;
                }
            } else {
                viewAllBtn?.remove();
            }
        };

        ctrl.getOffsetElements = function(arrClasses) {
            return arrClasses.reduce((prev, cur) => {
                const el = document.querySelector(cur);
                let elementHeight = 0;
                if (el) {
                    elementHeight = el.offsetHeight;
                }
                return prev + elementHeight;
            }, 0);
        };

        ctrl.addGreatParentCollection = (id, greatParent) => {
            storage.set(id, { ...storage.get(id), greatParent });
        };

        ctrl.addParentCollection = (id, parent) => {
            const record = storage.get(id);
            if(record?.submenu){
                parent.submenu = record.submenu;
            }
            storage.set(id, { ...record, parent });
        };

        ctrl.addSubmenuCollection = (id, submenu) => {
            const record = storage.get(id);
            if(record?.parent){
                record.parent.submenu = submenu;
            }
            storage.set(id, { ...record, submenu });
        };

        ctrl.getStorage = () => storage;
    };

    angular.module('submenu').controller('SubmenuContainerCtrl', SubmenuContainerCtrl);

    SubmenuContainerCtrl.$inject = ['$element', '$window', '$scope', 'windowService', 'submenuService', 'domService', '$timeout'];
})(window.angular);
