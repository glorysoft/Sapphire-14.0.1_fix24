(function (ng) {
    

    angular
        .module('select', [])
        .directive('select', [
            '$parse',
            '$timeout',
            function ($parse, $timeout) {
                return {
                    require: '?ngModel',
                    restrict: 'E',
                    link (scope, element, attrs, ctrl) {
                        let selectValue;

                        if (
                            ctrl != null &&
                            !attrs.ngOptions &&
                            attrs.disabledAutobind == null &&
                            (ctrl.$modelValue === undefined || isNaN(ctrl.$modelValue))
                        ) {
                            selectValue = element.val();

                            $parse(attrs.ngModel).assign(
                                scope,
                                attrs.convertToNumber != null
                                    ? parseFloat(selectValue, 10)
                                    : attrs.convertToBool != null
                                      ? selectValue === 'True'
                                      : selectValue,
                            );
                        }

                        if (attrs.onChange != null && attrs.onChange.length > 0) {
                            const onChangeCallback = $parse(attrs.onChange),
                                onChangeHandler = function (event) {
                                    onChangeCallback(scope, { event });
                                };

                            element.on('change', onChangeHandler);

                            element.on('$destroy', () => {
                                element.off('change', onChangeHandler);
                            });
                        }
                    },
                };
            },
        ])
        .directive('convertToNumber', () => ({
                require: 'ngModel',
                link (scope, element, attrs, ngModel) {
                    ngModel.$parsers.push((val) => angular.isArray(val)
                            ? val.map((item) => parseFloat(item, 10))
                            : parseFloat(val, 10));
                    ngModel.$formatters.push((val) => angular.isArray(val)
                            ? val.map((item) => item != null ? `${  item}` : item)
                            : val != null
                              ? `${  val}`
                              : val);
                },
            }))
        .directive('convertToBool', () => ({
                require: 'ngModel',
                link (scope, element, attrs, ngModel) {
                    ngModel.$parsers.push((val) => val != null ? val.toLowerCase() === 'true' : val);
                    ngModel.$formatters.push((val) => val != null ? (val === true ? 'True' : 'False') : val);
                },
            }));
})(window.angular);
