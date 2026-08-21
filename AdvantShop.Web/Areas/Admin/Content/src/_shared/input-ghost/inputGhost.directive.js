(function (ng) {
    

    ng.module('inputGhost').directive('inputGhost', () => ({
            require: {
                ngModel: 'ngModel',
            },
            controller: 'InputGhostCtrl',
            controllerAs: 'inputGhost',
            bindToController: true,
            compile (cElement) {
                cElement[0].classList.add('input-ghost');

                return function (scope, element, attrs) {
                    scope.$watch('inputGhost.ngModel.$viewValue', (newVal) => {
                        attrs.$set('size', newVal == null || newVal.length === 1 ? 1 : newVal.length);
                    });
                };
            },
        }));
})(window.angular);
