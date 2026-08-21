import Choices from 'choices.js';

import { CUSTOM_EVENTS_MAP } from './choices.constants.js';

export default /* @ngInject */ function ($attrs, $element, $parse, $scope, choiceDefaultConfig, $transclude) {
    // eslint-disable-next-line no-invalid-this
    const ctrl = this;
    let options,
        choicesObj,
        choicesOldVal,
        emptyOption,
        isInitialized = false;

    ctrl.$onInit = () => {
        if (!$transclude.isSlotFilled('select')) {
            validationOptionParams($attrs, 'label');
            validationOptionParams($attrs, 'value');
        }

        ctrl.choiceItems = null;
        options = angular.merge({}, choiceDefaultConfig, ctrl.options || {});

        if ($attrs.callbackOnInit != null) {
            options.callbackOnInit = function () {
                // 'this' from choices lib. Inside calling callbackOnInit.call(this)
                ctrl.callbackOnInit({ choices: this });
            };
        }

        if ($attrs.callbackOnCreateTemplates != null) {
            options.callbackOnCreateTemplates = (template) => ctrl.callbackOnCreateTemplates({ template });
        }

        if ($attrs.sorter != null) {
            // eslint-disable-next-line id-length
            options.sorter = (a, b) => ctrl.sorter({ a, b });
        }

        if ($attrs.addItemText != null) {
            options.addItemText = (value) => ctrl.addItemText({ value });
        }

        if ($attrs.maxItemText != null) {
            options.maxItemText = (maxItemCount) => ctrl.maxItemText({ maxItemCount });
        }

        if ($attrs.valueComparer != null) {
            options.valueComparer = (value1, value2) => ctrl.valueComparer({ value1, value2 });
        }

        if (Object.hasOwn(options, 'classNamesAppend')) {
            for (const classKey in options.classNamesAppend) {
                if (Object.hasOwn(options.classNames, classKey) && options.classNamesAppend[classKey].length > 0) {
                    options.classNames[classKey] = options.classNames[classKey].concat(options.classNamesAppend[classKey]);
                }
            }
            delete options.classNamesAppend;
        }

        if ($transclude.isSlotFilled('ngChoicesItemTemplate') || $transclude.isSlotFilled('ngChoicesChoiceTemplate')) {
            options.allowHTML = true;
            const templateConfig = {};

            if ($transclude.isSlotFilled('ngChoicesItemTemplate')) {
                templateConfig.item = (...args) => {
                    const base = Choices.defaults.templates.item(...args);

                    return createTemplate($scope, $transclude, 'ngChoicesItemTemplate', base, args);
                };
            }

            if ($transclude.isSlotFilled('ngChoicesChoiceTemplate')) {
                templateConfig.choice = (...args) => {
                    const base = Choices.defaults.templates.choice(...args);
                    return createTemplate($scope, $transclude, 'ngChoicesChoiceTemplate', base, args);
                };
            }

            options.callbackOnCreateTemplates = () => templateConfig;
        }
    };

    ctrl.$postLink = () => {
        const select = $element[0].querySelector('select');

        const modelValueSetter = $parse($attrs.ngModel).assign;
        const choiceCallback = (event) => {
            if (event.detail.disabled) {
                return;
            }
            modelValueSetter($scope.$parent, event.detail.customProperties || event.detail.value);
            $scope.$apply();
        };

        select.addEventListener('choice', choiceCallback);

        for (const eventKey in CUSTOM_EVENTS_MAP) {
            if ($attrs[eventKey] != null) {
                select.addEventListener(CUSTOM_EVENTS_MAP[eventKey], (...args) => {
                    ctrl[eventKey]({ ...args });
                });
            }
        }

        choicesObj = new Choices(select, options);

        const showDropdownCallback = () => {
            const selectedChoice = choicesObj._store.choices.find((item) => item.selected && !item.placeholder);
            if (selectedChoice?.choiceEl) {
                choicesObj._highlightChoice(selectedChoice.choiceEl);
            }
        };
        select.addEventListener('showDropdown', showDropdownCallback);

        if ($transclude.isSlotFilled('select') && ctrl.choiceItems == null) {
            const selectTemplate = $transclude($scope, (clone) => clone, null, 'select');
            ctrl.choiceItems = Array.from(selectTemplate[0].options).map((item) => ({
                value: item.value,
                label: item.innerHTML,
                selected: item.selected,
            }));

            choicesObj.setChoices(ctrl.choiceItems, 'value', 'label', true);
        }

        $scope.$watch(
            () => ctrl.ngModel.$modelValue,
            () => {
                if (ctrl.ngModel.$modelValue == null) {
                    emptyOption ||= {
                        label: 'Не выбрано',
                        value: '',
                        selected: true,
                    };
                    choicesObj.setChoices([emptyOption, ...ctrl.choiceItems], 'value', 'label', true);
                    return;
                }

                let itemSelected;

                if ($transclude.isSlotFilled('select')) {
                    itemSelected = ctrl.choiceItems.find((x) => x.value === ctrl.ngModel.$modelValue);
                } else {
                    itemSelected = ctrl.choiceItems.find((x) => x.customProperties === ctrl.ngModel.$modelValue);
                }

                if (itemSelected != null) {
                    choicesObj.setChoiceByValue(itemSelected.value);
                }
            },
        );

        if (ctrl.choices != null) {
            ctrl.setChoices(ctrl.choices);
        }

        isInitialized = true;

        $element.on('$destroy', () => {
            choicesObj.destroy();
            select.removeEventListener('choice', choiceCallback);
            select.removeEventListener('showDropdown', showDropdownCallback);
        });
    };

    ctrl.$doCheck = () => {
        if (isInitialized && angular.equals(choicesOldVal, ctrl.choices) === false) {
            ctrl.setChoices(ctrl.choices);
            choicesOldVal = angular.copy(ctrl.choices);
        }
    };

    ctrl.setChoices = (data) => {
        if (ctrl.choiceItems != null) {
            ctrl.choiceItems.length = 0;
        } else {
            ctrl.choiceItems = [];
        }
        let valueTemp, customPropertiesTemp, locals;
        for (const choicesDataItem of data) {
            locals = { choice: { customProperties: choicesDataItem } };
            valueTemp = ctrl.valueKey != null ? choicesDataItem[ctrl.valueKey] : ctrl.valueFn(locals);
            customPropertiesTemp = ctrl.customPropertiesKey != null ? choicesDataItem[ctrl.customPropertiesKey] : ctrl.customPropertiesFn(locals);
            ctrl.choiceItems.push({
                value: valueTemp,
                label: ctrl.labelKey != null ? choicesDataItem[ctrl.labelKey] : ctrl.labelFn(locals),
                disabled: ctrl.disabledKey != null ? choicesDataItem[ctrl.disabledKey] : ctrl.disabledFn(locals),
                customProperties: customPropertiesTemp,
                selected: angular.equals(ctrl.ngModel.$modelValue, customPropertiesTemp || valueTemp),
            });
        }
        choicesObj.setChoices(ctrl.choiceItems, 'value', 'label', true);
    };
}

const validationPostfix = ['Key', 'Fn'];
const validationOptionParams = ($attrs, baseProp) => {
    if (validationPostfix.every((x) => $attrs[baseProp + x] == null)) {
        throw new Error(`Missing one of the options: ${validationPostfix.map((x) => baseProp + x).join(' or ')}`);
    }
};

const createTemplate = ($scope, $transclude, slotName, base, [config, choice]) => {
    const scopeChild = $scope.$parent.$new();
    scopeChild.config = config;
    scopeChild.choice = choice;
    const el = $transclude(scopeChild, (clone) => clone, null, slotName);
    base.textContent = '';
    base.appendChild(el[0]);
    return base;
};
