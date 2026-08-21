(function (ng) {
    

    angular.module('urlGenerator', []).directive('urlGenerator', [
        '$http',
        function ($http) {
            return {
                restrict: 'A',
                scope: {
                    urlPath: '=',
                    urlGeneratorEnabled: '<?',
                },
                link (scope, element, attrs) {
                    let timer;

                    if (scope.urlGeneratorEnabled) {
                        element.bind('keyup', () => {
                            const url = scope.urlPath;
                            const name = element[0].value;

                            if (timer != null) {
                                clearTimeout(timer);
                            }

                            setTimeout(() => {
                                $http.get(`common/generateUrl?name=${  name}`).then((response) => {
                                    scope.urlPath = response.data;
                                });
                            }, 500);
                        });
                    }
                },
            };
        },
    ]);
})(window.angular);
