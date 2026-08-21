const positionList = ['top', 'left', 'bottom', 'width'];
const positionListReset = {
    top: 'auto',
    left: 'auto',
    bottom: 'auto',
};

const REGEXP_SCROLL_PARENT = /^(?<prop>visible|hidden)/u;
const getScrollParent = (el) =>
    !(el instanceof HTMLElement) || typeof window.getComputedStyle !== 'function'
        ? null
        : el.scrollHeight >= el.clientHeight && !REGEXP_SCROLL_PARENT.test(window.getComputedStyle(el).overflowY || 'visible')
          ? el
          : getScrollParent(el.parentElement) || document.body;

/*@ngInject*/
function AutocompleterCtrl($scope, autocompleterService, domService, $timeout, $parse, $q) {
    const ctrl = this;
    let listScrollable, autocompleterInputElement, listWrap, scrollParent, showEmptyResultMessageDirty;

    ctrl.$onInit = function () {
        ctrl.result = null;
        ctrl.activeItem = null;
        ctrl.isVisibleAutocomplete = false;
        ctrl.viewMode = 'default';
        ctrl.itemFromObjects = [];
        ctrl.items = [];
        ctrl.isClickedItem = false;

        showEmptyResultMessageDirty = ctrl.showEmptyResultMessage && ctrl.showEmptyResultMessage();

        ctrl.showEmptyResultMessage = showEmptyResultMessageDirty ? showEmptyResultMessageDirty : true;

        if (ctrl.onInit) {
            ctrl.onInit({ autocompleter: ctrl });
        }
    };

    ctrl.toggleVisible = function (visible) {
        ctrl.onChangeVisibility({ visible });
        if (visible === true) {
            ctrl.activeItem = null;
        }

        if (ctrl.isVisibleAutocomplete !== visible) {
            if (visible === true) {
                listWrap.classList.add('autocompleter-sub--calc');
                listWrap.classList.add('autocompleter-sub--visible');
            } else {
                listWrap.classList.remove('autocompleter-sub--calc');
                listWrap.classList.remove('autocompleter-sub--visible');
            }
            ctrl.isVisibleAutocomplete = visible;
        }
    };

    ctrl.addList = function (listDOM, listController) {
        listWrap = listDOM;
        scrollParent = getScrollParent(listWrap);
        listScrollable = listDOM.querySelector('.js-autocompleter-list');
        ctrl.listCtrl = listController;
        if (ctrl.appendToBody) {
            window.addEventListener(
                'scroll',
                () => {
                    ctrl.recalcPositionAutocompleList(false);
                    $scope.$apply();
                },
                { passive: true },
            );
        }
    };

    ctrl.addItem = function (item) {
        item.groupIndex = item.groupIndex ? item.groupIndex : 0;

        ctrl.items[item.groupIndex] ||= [];

        if (!item.index) {
            ctrl.items[item.groupIndex].push(item);
            item.index = ctrl.items[item.groupIndex].length - 1;
        } else {
            ctrl.items[item.groupIndex][item.index] = item;
        }

        return ctrl.items;
    };

    ctrl.setListPosition = function (pos) {
        if (listWrap) {
            ctrl.listPositional = pos;
            for (const name of positionList) {
                if (pos.hasOwnProperty(name)) {
                    listWrap.style.setProperty(name, pos[name] + (typeof pos[name] !== 'string' ? 'px' : ''));
                } else {
                    listWrap.style.removeProperty(name);
                }
            }
        }
    };

    ctrl.request = function (val) {
        if (angular.isDefined(val) && val.length >= ctrl.minLength) {
            autocompleterService.getData(ctrl.requestUrl, val, ctrl.params).then((response) => {
                ctrl.result = response;
                //ctrl.items.length = 0;

                if (!ctrl.result) {
                    return;
                }

                if (angular.isArray(ctrl.result)) {
                    ctrl.viewMode = 'default';
                    ctrl.emptyResult = ctrl.result.length === 0;
                } else {
                    ctrl.viewMode = 'additional';
                    ctrl.emptyResult = ctrl.result.Empty === true;
                }
                ctrl.toggleVisible(true);
            });
        } else if (angular.isDefined(val) && val.length < ctrl.minLength) {
            ctrl.toggleVisible(false);
        }
    };

    ctrl.navigate = function (isDown) {
        let newActiveItem, currentItem, currentGroup;

        const navVal = isDown === true ? 1 : -1;

        if (ctrl.items.length === 0) {
            return;
        }

        if (!ctrl.activeItem) {
            currentGroup = ctrl.getIndexFirstOrDefaultGroup();
            currentItem = ctrl.getIndexFirstOrDefaultItem(currentGroup);
            newActiveItem = currentItem;
        } else {
            currentItem = ctrl.activeItem;
            newActiveItem = ctrl.items[currentItem.groupIndex][currentItem.index + navVal];
        }

        //пытаемся найти элемент в след./пред. группе
        if (!newActiveItem && ctrl.items[currentItem.groupIndex + navVal]?.length > 0) {
            newActiveItem = ctrl.getIndexFirstOrDefaultItem(ctrl.items[currentItem.groupIndex + navVal]);
        }

        if (newActiveItem) {
            ctrl.processItems((_group, item) => {
                if (item) {
                    item.isActive = false;
                }
            });

            newActiveItem.isActive = true;
            ctrl.activeItem = newActiveItem;

            ctrl.checkScroll(ctrl.activeItem.itemDOM);
        } else {
            ctrl.activeItem = null;
        }
    };

    ctrl.checkScroll = function (element) {
        const topContainer = listScrollable.scrollTop,
            bottomContainer = topContainer + listScrollable.clientHeight,
            topItem = element.offsetTop,
            heightItem = element.clientHeight,
            bottomItem = topItem + heightItem;

        if (bottomContainer < bottomItem) {
            listScrollable.scrollTop += heightItem;
        } else if (topContainer > topItem) {
            listScrollable.scrollTop = topItem;
        }
    };

    ctrl.apply = function (val, event) {
        ctrl.model.$setViewValue(val);
        ctrl.model.$render();

        ctrl.applyFn({ value: val, obj: ctrl.activeItem?.item, event });

        ctrl.toggleVisible(false);

        ctrl.isDirty = false;
    };

    ctrl.autocompleteKeyup = function ($event, val, element) {
        autocompleterInputElement = element;

        const { keyCode } = $event;

        switch (keyCode) {
            case 38: //arrow up
                $event.stopPropagation();
                $event.preventDefault();
                ctrl.navigate(false);
                break;
            case 40: //arrow down
                $event.stopPropagation();
                $event.preventDefault();
                ctrl.navigate(true);
                break;
            case 13: //enter
                if (ctrl.activeItem) {
                    $event.stopPropagation();
                    ctrl.apply(ctrl.activeItem.item[ctrl.field], $event);
                } else {
                    ctrl.apply(val, $event);
                }
                break;
            default:
                $event.stopPropagation();
                ctrl.isDirty = true;
                ctrl.request(val);
                break;
        }
    };

    ctrl.crossClick = function ($event) {
        ctrl.toggleVisible(false);

        $event.stopPropagation();
    };

    ctrl.itemClick = function ($event, item) {
        ctrl.isClickedItem = true;

        const selectedValue = $parse(ctrl.field)(item.item);

        ctrl.apply(selectedValue, $event);

        $event.stopPropagation();
    };

    ctrl.itemActive = function (item) {
        item.isActive = true;
        ctrl.activeItem = item;
    };

    ctrl.itemDeactive = function (item) {
        item.isActive = false;
        ctrl.activeItem = null;
    };

    ctrl.clickOut = function (event) {
        if (ctrl.isVisibleAutocomplete === true && !domService.closest(event.target, '.js-autocompleter-sub')) {
            $scope.$apply(() => {
                ctrl.toggleVisible(false);
            });
        }
    };

    ctrl.getIndexFirstOrDefaultGroup = function () {
        let group;

        for (let i = 0, len = ctrl.items.length; i < len; i++) {
            if (ctrl.items[i]?.length > 0) {
                group = ctrl.items[i];
                break;
            }
        }

        return group;
    };

    ctrl.getIndexFirstOrDefaultItem = function (group) {
        let item;

        for (let i = 0, len = group.length; i < len; i++) {
            if (group[i]) {
                item = group[i];
                break;
            }
        }

        return item;
    };

    ctrl.processItems = function (func) {
        ctrl.items.forEach((item) => {
            if (item) {
                for (const item1 of item) {
                    if (func(item, item1) === false) {
                        break;
                    }
                }
            }
        });
    };

    ctrl.recalcPositionAutocompleList = function (hideOnCalc = true) {
        const defer = $q.defer();

        if (hideOnCalc !== false) {
            ctrl.setListPosition(positionListReset);
            $timeout(() => {
                defer.resolve();
            }, 0);
        } else {
            defer.resolve();
        }

        defer.promise.then(() => {
            const position = {};
            const listWrapCoordinates = listWrap.getBoundingClientRect();
            const inputCoordinates = autocompleterInputElement[0].getBoundingClientRect();
            const listWrapHeight = listWrapCoordinates.height;
            if (ctrl.appendToBody) {
                position.width = inputCoordinates.width;
                position.left = inputCoordinates.left + window.scrollX;
                ctrl.maxHeightList = window.innerHeight - inputCoordinates.bottom - inputCoordinates.height;
                position.top = inputCoordinates.bottom + window.scrollY;
            } else {
                position.left =
                    scrollParent.clientWidth >= inputCoordinates.left + listWrapCoordinates.width ? autocompleterInputElement[0].offsetLeft : 'auto';
                const listWrapTop = listWrap.offsetTop;
                const inputTop = autocompleterInputElement[0].offsetTop;
                const positionVertical = listWrapTop + listWrapHeight > scrollParent.getBoundingClientRect().bottom ? 'bottom' : 'top';
                position[positionVertical] = (inputTop > 50 ? inputTop : 0) + autocompleterInputElement[0].offsetHeight;
            }
            ctrl.setListPosition(position);
            listWrap.classList.remove('autocompleter-sub--calc');
        });
    };
}

export default AutocompleterCtrl;
