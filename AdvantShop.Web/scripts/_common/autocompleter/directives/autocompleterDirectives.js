import itemTemplate from '../templates/_item.html';
import listTemplate from '../templates/_list.html';

/*@ngInject*/
function autocompleterDirective(autocompleterConfig, autocompleterService) {
    return {
        restrict: 'A',
        scope: {
            requestUrl: '@',
            minLength: '&',
            templatePath: '@',
            field: '@',
            linkAll: '@',
            showMode: '@',
            maxHeightList: '&',
            applyFn: '&',
            params: '<?',
            showEmptyResultMessage: '&',
            onInit: '&',
            onChangeVisibility: '&',
            appendToBody: '<?',
        },
        controller: 'AutocompleterCtrl',
        controllerAs: 'autocompleter',
        bindToController: true,
        link(_scope, element, _attrs, ctrl) {
            const minLength = ctrl.minLength();
            ctrl.minLength = minLength > 0 ? minLength : autocompleterConfig.minLength;

            const maxHeightList = ctrl.maxHeightList();
            ctrl.maxHeightList = maxHeightList > 0 ? maxHeightList : autocompleterConfig.maxHeightList;

            ctrl.autocompleterElement = element;

            ctrl.storageKey = autocompleterService.generateKeyStorage();
            autocompleterService.addInStorage(ctrl.storageKey, 'autocompleter', ctrl);
        },
    };
}

/*@ngInject*/
function autocompleterInputDirective($compile, $timeout, $window) {
    return {
        require: ['autocompleterInput', 'ngModel', '^autocompleter'],
        restrict: 'A',
        controller: 'AutocompleterInputCtrl',
        controllerAs: 'autocompleterInput',
        bindToController: true,
        scope: true,
        link(scope, element, attrs, ctrls) {
            if (attrs.autocompleterDisabled === 'true') {
                return;
            }

            //optionsAttributes:
            //-autocompleteDebounce
            //-autocompleteApplyOnBlur
            const [ctrl, ngModel, parentCtrl] = ctrls;

            ctrl.listRendered = false;

            element[0].setAttribute('autocomplete', 'new-password');

            const debounceDirty = parseFloat(attrs.autocompleteDebounce);
            const delay = isNaN(debounceDirty) === false ? debounceDirty : 700;
            let timer;

            const createList = () => {
                if (ctrl.listRendered === false) {
                    ctrl.listRendered = true;

                    const list = angular.element(`<div data-autocompleter-list data-storage-key="${parentCtrl.storageKey}"></div>`);

                    if (parentCtrl.appendToBody) {
                        angular.element(document.body).append(list);
                    } else {
                        parentCtrl.autocompleterElement.append(list);
                    }
                    $compile(list)(scope);
                }
            };


            element[0].addEventListener('keyup', (event) => {
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(() => {
                    scope.$apply(() => {
                        createList();
                        parentCtrl.autocompleteKeyup(event, element[0].value, element);
                    });
                }, delay);
            });

            element[0].addEventListener('paste', (event) => {
                const pastedText = (event.clipboardData || window.clipboardData).getData('text').trim();

                scope.$apply(() => {
                    createList();
                    parentCtrl.autocompleteKeyup(event, pastedText, element);
                });
            });

            $window.addEventListener('resize', () => {
                if (parentCtrl.isVisibleAutocomplete === true) {
                    $timeout(() => {
                        parentCtrl.recalcPositionAutocompleList(false);
                    });
                }
            });

            if (!attrs.autocompleteApplyOnBlur || attrs.autocompleteApplyOnBlur === 'true') {
                element[0].addEventListener('blur', (event) => {
                    if (parentCtrl.listCtrl && parentCtrl.listCtrl.getStateHover() === false && parentCtrl.isDirty === true) {
                        parentCtrl.applyFn({
                            value: ngModel.$modelValue,
                            obj: parentCtrl.activeItem ? parentCtrl.activeItem.item : null,
                            event,
                        });
                    }
                });
            }

            parentCtrl.model = ngModel;
        },
    };
}

/*@ngInject*/
function autocompleterListDirective($parse, $timeout, autocompleterService) {
    return {
        restrict: 'A',
        controller: 'AutocompleterListCtrl',
        controllerAs: 'autocompleterList',
        bindToController: true,
        scope: true,
        replace: true,
        templateUrl: listTemplate,
        link(scope, element, attrs, ctrl) {

            ctrl.parentScope = autocompleterService.getFromStorage($parse(attrs.storageKey)(scope), 'autocompleter');

            const removeWatchListener = scope.$watch(
                () => ctrl.parentScope.isVisibleAutocomplete,
                (newValue) => {
                    if (newValue) {
                        $timeout(() => {
                            ctrl.parentScope.recalcPositionAutocompleList();
                        });
                    }
                },
            );

            const removeWatchVisibleParentListener = scope.$watch(() => ctrl.parentScope.autocompleterElement.height() > 0 && ctrl.parentScope.autocompleterElement.width(),
                (newValue, oldValue) => {
                    if (newValue === false && newValue !== oldValue) {
                        ctrl.parentScope.toggleVisible(false);
                    }
                });

            scope.$on('$destroy', () => {
                removeWatchListener();
                removeWatchVisibleParentListener();
            });

            ctrl.parentScope.addList(element[0], ctrl);
        },
    };
}

/* @ngInject */
function autocompleterItemDirective(autocompleterService) {
    return {
        require: ['autocompleterItem', '^autocompleterList'],
        controller: 'AutocompleterItemCtrl',
        controllerAs: 'autocompleterItem',
        bindToController: true,
        restrict: 'A',
        scope: {
            item: '=',
            itemTemplatePath: '=?',
            index: '=?',
            groupIndex: '=?',
        },
        templateUrl: itemTemplate,
        replace: true,
        link(scope, element, _attrs, ctrls) {
            const [ctrl, autocompleterList] = ctrls;
            ctrl.parentScope = autocompleterService.getFromStorage(autocompleterList.parentScope.storageKey, 'autocompleter');

            [ctrl.itemDOM] = element;

            ctrl.parentScope.addItem(ctrl);

            scope.$on('$destroy', (destroyEvent) => {
                const currentScope = destroyEvent.currentScope.autocompleterItem;

                if (currentScope) {
                    currentScope.parentScope.items[currentScope.groupIndex].splice(currentScope.index, 1);
                }
            });
        },
    };
}

export {autocompleterDirective, autocompleterInputDirective, autocompleterListDirective, autocompleterItemDirective};
