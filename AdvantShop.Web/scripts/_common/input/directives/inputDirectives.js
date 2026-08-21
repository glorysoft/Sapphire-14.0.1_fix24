const trim = (value) => typeof value === 'string' ? value.replace(/^\s+|\s+$/u, '') : value;
const isTextField = (type) => type !== 'radio' && type !== 'checkbox';
angular.module('input').directive('input',
    /* @ngInject */
    ($parse, $window) => ({
        restrict: 'E',
        require: '?ngModel',
        priority: 200,
        // eslint-disable-next-line complexity
        link(scope, element, attrs, ctrl) {
            const valueDirty = attrs.value,
                el = element[0],
                type = element[0].type;

            let value,
                valueScope;

            if (isTextField(type)) {
                const inputCallback = () => {
                    el.value = trim(el.value);
                };

                el.addEventListener('change', inputCallback);

                const callbackPaste = function (event) {
                    let content;

                    if ($window.clipboardData && $window.clipboardData.getData) {
                        // IE
                        content = $window.clipboardData.getData('Text');
                    } else {
                        // others
                        content = event.clipboardData.getData('text/plain');
                    }

                    if (content) {
                        ctrl.$setViewValue(trim(content));
                    }
                };

                el.addEventListener('paste', callbackPaste);

                scope.$on('$destroy', () => {
                    el.removeEventListener('input', inputCallback);
                    el.removeEventListener('paste', callbackPaste);
                });
            }

            if (!ctrl) {
                return;
            }

            ctrl.$parsers.push(trim);
            ctrl.$formatters.push(trim);

            if (ctrl.$modelValue === undefined || Number.isNaN(ctrl.$modelValue)) {
                valueScope = $parse(attrs.ngModel)(scope);

                switch (type) {
                    case 'radio':
                        if (attrs.checked) {
                            value = attrs.ngValue ? $parse(attrs.ngValue)(scope) : valueDirty;
                        }
                        break;
                    case 'checkbox':
                        if (attrs.checked) {
                            value = attrs.ngTrueValue ? $parse(attrs.ngTrueValue)(scope) : true;
                        } else if (attrs.ngFalseValue) {
                            value = $parse(attrs.ngFalseValue)(scope);
                        }
                        break;
                    case 'number':
                        if (valueDirty?.length > 0) {
                            const numberParsed = Number(valueDirty.replace(',', '.').replace(/\s*/u, ''));
                            value = isNaN(numberParsed) === false ? numberParsed : null;
                        }
                        if (valueScope && angular.isNumber(valueScope) === false) {
                            valueScope = Number(valueScope.replace(',', '.').replace(/\s*/u, ''));
                        }
                        break;
                    case 'datetime-local':
                    case 'date':
                        if (valueDirty?.length > 0) {
                            const dateObj = new Date(valueDirty);
                            value = isNaN(dateObj) === false ? dateObj : null;
                        }
                        break;
                    default:
                        if (valueDirty?.length > 0) {
                            value = trim(valueDirty);
                        }
                        break;
                }

                if (typeof value !== 'undefined' && value !== null) {
                    const valAssign = valueScope && Number.isNaN(valueScope) === false ? valueScope : value;
                    $parse(attrs.ngModel).assign(scope, valAssign);
                }
            }
        }
    }));

angular.module('input').directive('textarea',
    () => ({
        restrict: 'E',
        bindToController: true,
        require: {
            ngModelCtrl: '?ngModel',
        },
        /* @ngInject */
        controller($attrs, $element, $parse, $scope, $window) {
            const ctrl = this;

            ctrl.$onInit = function () {
                const val = $element.val();
                const isNotEmpty = val.replaceAll(/\s/ug, ``).length > 0;

                if (ctrl.ngModelCtrl && isNotEmpty) {
                    $parse($attrs.ngModel).assign($scope, val);
                }

                const callbackPaste = function (event) {
                    let content;

                    if ($window.clipboardData && $window.clipboardData.getData) {
                        // IE
                        content = $window.clipboardData.getData('Text');
                    } else {
                        // others
                        content = event.clipboardData.getData('text/plain');
                    }

                    if (content && ctrl.ngModelCtrl) {
                        ctrl.ngModelCtrl.$setViewValue(content);
                    }
                };

                $element[0].addEventListener('paste', callbackPaste);

                $scope.$on('$destroy', () => {
                    $element[0].removeEventListener('paste', callbackPaste);
                });
            };
        }
    }));
