(function (ng) {
    

    ng.module('elasticText', []).directive('elasticText', [
        '$timeout',
        function ($timeout) {
            return {
                restrict: 'A',
                link ($scope, element) {
                    $scope.initialHeight = $scope.initialHeight || element[0].style.height;
                    const maxHeight = parseInt(element[0].getAttribute('data-elastic-max-height'));
                    $scope.maxHeight = isNaN(maxHeight) ? 0 : maxHeight;

                    const resize = function () {
                        element[0].style.height = $scope.initialHeight;
                        element[0].style.height =
                            `${ 
                            $scope.maxHeight != 0 && element[0].scrollHeight > $scope.maxHeight ? $scope.maxHeight : element[0].scrollHeight + 2 
                            }px`;
                    };
                    element.on('change', resize);
                    $timeout(resize, 0);
                },
            };
        },
    ]);
})(window.angular);
