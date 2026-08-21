angular.module('validation').directive('buttonValidation',
    /* @ngInject */
    ($parse, domService, scrollToBlockService) => ({
        restrict: 'A',
        require: ['?^form'],
        link(scope, element, attrs, ctrls) {
            const [FormCtrl] = ctrls,
                customValidFunc = $parse(attrs.buttonValidation),
                startFunc = $parse(attrs.buttonValidationStart),
                successFunc = $parse(attrs.buttonValidationSuccess),
                formNames = $parse(attrs.buttonValidationForms),
                disableScroll = Boolean(attrs.disableScroll);

            if (!FormCtrl) {
                return;
            }

            function validate(event) {
                scope.clickEvent = event;
                scope.FormCtrl = FormCtrl;

                startFunc(scope);

                if (FormCtrl.$invalid === true || customValidFunc(scope) === false) {
                    FormCtrl.$setSubmitted();
                    FormCtrl.$setDirty();
                    event.preventDefault();
                    event.stopPropagation();

                    const form = findForm(event, formNames(scope));

                    if (form && !disableScroll) {
                        const invalidElementFocus = form.querySelector('.ng-invalid:not(form):not(ng-form)');

                        if (invalidElementFocus) {
                            const scrollParentElement = findScrollParent(invalidElementFocus);
                            if (scrollParentElement) {
                                scrollToBlockService.scrollToBlock(invalidElementFocus, { scrollParentElement });
                            }
                            invalidElementFocus.focus();
                        }
                    }
                } else {
                    successFunc(scope);
                }

                scope.$apply();
            }

            function findForm(event, formNamesList) {
                let currentFrom;

                if (formNamesList) {
                    for (let i = 0, len = formNamesList.length; i < len; i++) {
                        if (document.forms[formNamesList[i]] && document.forms[formNamesList[i]].classList.contains('ng-invalid')) {
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
    }));

angular.module('validation').directive('validationCustomFunction', () => ({
    require: {
        ngModelCtrl: 'ngModel',
    },
    bindToController: true,
    /* @ngInject */
    controller($attrs, $parse, $scope) {
        const ctrl = this;
        ctrl.$onInit = function() {
            const validate = $parse($attrs.validationCustomFunction);

            ctrl.ngModelCtrl.$validators.validationCustomFunction = function(modelValue, viewValue) {
                return validate($scope, {
                    modelValue,
                    viewValue,
                });
            };
        };
    },
}));
angular.module('validation').directive('validationInputFloat', () => ({
    require: {
        ngModelCtrl: 'ngModel',
    },
    bindToController: true,
    controller() {
        const ctrl = this;
        ctrl.$onInit = function() {
            ctrl.ngModelCtrl.$formatters.push((value) => {
                if (!value) return value;
                return value.toString().replace(/\s*/gu, '').replace(/\./gu, ',');
            });
        };
    },
}));

function findScrollParent(element) {
    if (element === document.body) {
        return window; // If no scrollable parent found, return window (for document scrolling)
    }

    const style = window.getComputedStyle(element);

    if(style.position === 'fixed'){
        return null;
    }

    // Check for overflow properties
    const {overflowX, overflowY} = style;

    const isScrollableY = overflowY === 'auto' || overflowY === 'scroll';
    const isScrollableX = overflowX === 'auto' || overflowX === 'scroll';

    // Check if content overflows the element's dimensions
    const hasOverflowY = element.scrollHeight > element.clientHeight;
    const hasOverflowX = element.scrollWidth > element.clientWidth;

    if ((isScrollableY && hasOverflowY) || (isScrollableX && hasOverflowX)) {
        return element; // This element is scrollable
    }

    // Recursively check the parent
    return findScrollParent(element.parentElement);
}
