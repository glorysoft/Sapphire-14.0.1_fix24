angular.module('angular-bind-html-compile', [])
    .directive('bindHtmlCompile', /* @ngInject */ ($compile) => ({
        restrict: 'A',
        compile(cElement){
            const defaultContent = cElement.html();
            return function(scope, element, attrs) {
                scope.$watch(attrs.bindHtmlCompile, function(newValue, oldValue) {

                    if (newValue === oldValue && (defaultContent.length > 0 && typeof newValue === 'undefined')) {
                        return;
                    }

                    // In case value is a TrustedValueHolderType, sometimes it
                    // needs to be explicitly called into a string in order to
                    // get the HTML string.
                    element.html(newValue && newValue.toString());
                    // If scope is provided use it, otherwise use parent scope
                    $compile(element.contents())(attrs.bindHtmlScope ? scope.$eval(attrs.bindHtmlScope) :  scope);
                });
            }
        }
    }));

