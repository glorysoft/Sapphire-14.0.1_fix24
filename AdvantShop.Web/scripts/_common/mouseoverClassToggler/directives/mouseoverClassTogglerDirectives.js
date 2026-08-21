(function (ng) {
    

    const isTouchDevice = 'ontouchstart' in document.documentElement;

    angular.module('mouseoverClassToggler').directive('mouseoverClassToggler', () => ({
            restrict: 'A',
            scope: {
                classToggle: '@',
            },
            link (scope, element, attrs, ctrl) {
                const classToggle = scope.classToggle ? scope.classToggle : 'active';

                if (isTouchDevice) {
                    element[0].addEventListener('click', (event) => {
                        //if you need prevent click on href
                        if (element.hasClass(classToggle) === false) {
                            event.preventDefault();
                        }

                        element.addClass(classToggle);
                    });
                } else {
                    element[0].addEventListener('mouseover', (event) => {
                        element.addClass(classToggle);
                    });
                }

                element[0].addEventListener('mouseleave', () => {
                    element.removeClass(classToggle);
                });
            },
        }));
})(angular);
