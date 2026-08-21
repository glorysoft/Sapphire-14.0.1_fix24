(function (ng) {
    

    angular.module('defaultButton').directive('defaultButton', [
        function () {
            return {
                restrict: 'A',
                link (scope, element, attrs) {
                    element[0].addEventListener('keyup', (event) => {
                        let btn;

                        //13 - enter
                        if (event.keyCode === 13) {
                            btn = document.querySelector(attrs.defaultButton);

                            if (btn != null) {
                                btn.click();
                            }
                        }
                    });
                },
            };
        },
    ]);
})(window.angular);
