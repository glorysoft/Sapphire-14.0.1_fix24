(function (ng) {
    
    ng.module('uiHelper', []).directive('hndlrEnter', () => function (scope, element, attrs) {
            element.bind('keydown keypress', (event) => {
                if (event.which === 13) {
                    scope.$apply(() => {
                        scope.$eval(attrs.hndlrEnter);
                    });
                    event.preventDefault();
                }
            });
        });
})(window.angular);
