import validationListItemTemplate from './../templates/validationListItem.html';
import validationListTemplate from './../templates/validationList.html';
import validationOutputTemplate from './../templates/validationOutput.html';


angular.module('validation').directive('buttonValidation',
    /* @ngInject */
    ($parse, domService, toaster, $translate, $filter) => ({
        restrict: 'A',
        require: {
            form: '?^form',
        },
        link(scope, element, attrs, ctrls) {
            if (ctrls.form == null && (attrs.formCtrl == null || attrs.formCtrl.length === 0)) {
                throw Error('Need parent from or set attribute "form" for buttonValidation directive');
            }
            const FormCtrl = ctrls.form || $parse(attrs.formCtrl)(scope),
                customValidFunc = $parse(attrs.buttonValidation),
                startFunc = $parse(attrs.buttonValidationStart),
                successFunc = $parse(attrs.buttonValidationSuccess),
                formNames = $parse(attrs.buttonValidationForms);

            function validate(event) {
                scope.clickEvent = event;
                scope.FormCtrl = FormCtrl;
                startFunc(scope);
                if (FormCtrl.$invalid === true || customValidFunc(scope) === false) {
                    event.preventDefault();
                    FormCtrl.$setSubmitted();
                    FormCtrl.$setDirty();
                    const form = findForm(event, formNames(scope));
                    if (form != null) {
                        const invalidElementFocus = form.querySelector('.ng-invalid:not(form)');
                        if (invalidElementFocus != null) {
                            invalidElementFocus.focus();
                        }
                    }
                    toaster.pop({
                        type: 'error',
                        title: $translate.instant('Admin.Js.Validation.ErrorEnteringData'),
                        body: 'validation-output',
                        bodyOutputType: 'directive',
                        directiveData: {
                            errors: $filter('validationUnique')(FormCtrl[attrs.form] ? FormCtrl[attrs.form].$error : FormCtrl.$error),
                        },
                        toasterId: 'toasterContainerAlternative',
                        timeout: 5000,
                    });
                } else {
                    successFunc(scope);
                }
                scope.$apply();
            }

            function findForm(event, formNamesList) {
                let currentFrom;
                if (formNamesList != null) {
                    for (let i = 0, len = formNamesList.length; i < len; i++) {
                        if (document.forms[formNamesList[i]].classList.contains('ng-invalid')) {
                            currentFrom = document.forms[formNamesList[i]];
                            break;
                        }
                    }
                } else {
                    currentFrom =
                        document.getElementById(event.target.getAttribute('form')) ||
                        domService.closest(event.target, 'ng-form') ||
                        domService.closest(event.target, 'form') ||
                        document.querySelector('form');
                }
                return currentFrom;
            }

            element[0].addEventListener('click', validate);
        },
    }),
);
angular.module('validation').directive('validationTabIndex',
    () => ({
        /* @ngInject */
        controller($attrs, $parse, $scope) {
            this.validationTabIndex = $parse($attrs.validationTabIndex)($scope);
        },
        controllerAs: 'validationTabIndex',
        bindToController: true,
    }));

angular.module('validation').directive('validationInputText', () => ({
    restrict: 'A',
    bindToController: true,
    controllerAs: 'validationInputText',
    /* @ngInject */
    controller($attrs, $interpolate, $scope) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.ngModelCtrl.validationInputText = $interpolate($attrs.validationInputText)($scope);
            ctrl.validationOpenTab = function () {
                ctrl.uibTabsetCtrl.select(ctrl.validationTabIndexCtrl.validationTabIndex);
            };
            $attrs.$observe('validationInputText', (value) => {
                ctrl.ngModelCtrl.validationInputText = $interpolate(value)($scope);
            });
        };
    },

    require: {
        ngModelCtrl: 'ngModel',
        validationTabIndexCtrl: '?^validationTabIndex',
        uibTabsetCtrl: '?^uibTabset',
    },
}));

angular.module('validation').directive('validationProblemsMessages', () => ({
    restrict: 'A',
    bindToController: true,
    /* @ngInject */
    controller($attrs, $parse, $scope) {
        const ctrl = this;
        ctrl.$onInit = function () {
            const parseFn = $parse($attrs.validationProblemsMessages);
            ctrl.ngModelCtrl.validationProblemsMessages = parseFn($scope);
        };
    },

    require: {
        ngModelCtrl: 'ngModel',
    },
}));

angular.module('validation').directive('validationErrorsText',
    () => ({
            restrict: 'A',
            bindToController: true,
            controllerAs: 'validationErrorsText',
            /* @ngInject */
            controller($attrs, $parse, $scope) {
                const ctrl = this;
                ctrl.$onInit = function() {
                    ctrl.ngModelCtrl.validationErrorsText = $parse($attrs.validationErrorsText)($scope);
                };
            },
            require: {
                ngModelCtrl: 'ngModel',
            },
        }),);
angular.module('validation').directive('validationOutput', [
    function() {
        return {
            templateUrl: validationOutputTemplate,
        };
    },
]);
angular.module('validation').component('validationList', {
    templateUrl: validationListTemplate,
    bindings: {
        validationType: '<',
        validationErrors: '<',
    },
});
angular.module('validation').component('validationListItem', {
    templateUrl: validationListItemTemplate,
    bindings: {
        error: '<?',
    },
    controller() {
        const ctrl = this;
        ctrl.goToElement = function(text, error) {
            let validationInputTextCtrl;

            let el = document.querySelector(error.$name?.length ? `[name="${error.$name}"]` : `[validation-input-text="${text}"]`);

            const closeBtn = document.querySelector('.toast-close-button');
            if (el != null) {
                if (el.type == null || ['input', 'textarea', 'select'].indexOf(el.tagName.toLowerCase()) === -1) {
                    el = el.querySelector('input:not([type="button"]), textarea');
                }
                validationInputTextCtrl = angular.element(el).controller('validationInputText');
                if (validationInputTextCtrl.uibTabsetCtrl != null && validationInputTextCtrl.validationTabIndexCtrl != null) {
                    validationInputTextCtrl.uibTabsetCtrl.active = validationInputTextCtrl.validationTabIndexCtrl.validationTabIndex;
                }
                setTimeout(() => {
                    if (el.ckEditorInstance) {
                        el.ckEditorInstance.focus();
                    } else {
                        el.focus();
                    }
                    closeBtn.click();
                }, 0);
            }
        };
    },
});
angular.module('validation').directive('validationInputFloat', () => ({
    require: {
        ngModelCtrl: 'ngModel',
    },
    bindToController: true,
    controller() {
        const ctrl = this;
        ctrl.$onInit = function() {
            ctrl.ngModelCtrl.$validators.validInputFloat = function(_modelValue, viewValue) {
                return viewValue == null || viewValue.length === 0 || (viewValue.length > 0 && /^-?[\s\d,\.]*$/u.test(viewValue));
            };
            ctrl.ngModelCtrl.$parsers.push((value) => {
                const result = parseFloat(value.replace(/\s*/gu, '').replace(/,/gu, '.'));
                return isNaN(result) === false ? result : value;
            });
            ctrl.ngModelCtrl.$formatters.push((value) => {
                if (value == null) return value;
                return value.toString().replace(/\s*/gu, '').replace(/\./gu, ',');
            });
        };
    },
}));
angular.module('validation').directive('validationInputNotEmpty', () => ({
    require: {
        ngModelCtrl: 'ngModel',
    },
    bindToController: true,
    /* @ngInject */
    controller($attrs, $parse, $scope) {
        const ctrl = this;
        ctrl.$onInit = function() {
            const valide = $parse($attrs.validationInputNotEmpty);
            ctrl.ngModelCtrl.$validators.validInputNotEmpty = function(modelValue, viewValue) {
                return valide($scope, {
                    modelValue,
                    viewValue,
                });
            };
        };
    },
}));
angular.module('validation').directive('validationInputMin', () => ({
    require: {
        ngModelCtrl: 'ngModel',
    },
    bindToController: true,
    /* @ngInject */
    controller($attrs, $parse, $scope) {
        const ctrl = this;
        ctrl.$onInit = function() {
            const minValueFn = $parse($attrs.validationInputMin);
            ctrl.ngModelCtrl.$validators.validInputMin = function(modelValue, viewValue) {
                const minValueParsed = minValueFn($scope);
                const valAsNumber = angular.isNumber(modelValue) === false ? convertToNumber(modelValue) : modelValue;
                return viewValue == null || viewValue.length === 0 || (isNaN(valAsNumber) === false && valAsNumber >= minValueParsed);
            };
            ctrl.ngModelCtrl.$parsers.push(convertToNumber);
        };
    },
}));
angular.module('validation').directive('validationInputMax', () => ({
    require: {
        ngModelCtrl: 'ngModel',
    },
    bindToController: true,
    /* @ngInject */
    controller($attrs, $parse, $scope) {
        const ctrl = this;

        ctrl.$onInit = function() {
            const maxValueFn = $parse($attrs.validationInputMax);

            ctrl.ngModelCtrl.$validators.validInputMax = function(modelValue, viewValue) {
                const maxValueParsed = maxValueFn($scope);
                const valAsNumber = angular.isNumber(modelValue) === false ? convertToNumber(modelValue) : modelValue;

                return viewValue == null || viewValue.length === 0 || (isNaN(valAsNumber) === false && valAsNumber <= maxValueParsed);
            };

            ctrl.ngModelCtrl.$parsers.push(convertToNumber);
        };
    },
}));

angular.module('validation').directive('validationInputNotCyrillic', () => ({
    require: {
        ngModelCtrl: 'ngModel',
    },
    bindToController: true,
    controller() {
        const ctrl = this;
        ctrl.$onInit = function() {
            ctrl.ngModelCtrl.$validators.validInputFloat = function(_modelValue, viewValue) {
                return viewValue == null || viewValue.length === 0 || (viewValue.length > 0 && !/[а-яА-ЯЁё]/u.test(viewValue));
            };
        };
    },
}));

const convertToNumber = function(value) {
    if (value != null) {
        const result = angular.isNumber(value) === false ? parseFloat(value.replace(/\s*/ug, '').replace(/,/ug, '.')) : value;
        return isNaN(result) === false ? result : value;
    }
    return value;
};
