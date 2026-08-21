(function (ng) {
    

    ng.module('adminColorScheme', []).directive('adminColorScheme', [
        'adminColorSchemeService',
        function (adminColorSchemeService) {
            return {
                restrict: 'A',
                scope: {},
                link (scope, element) {
                    adminColorSchemeService.memoryStylesheet(element);
                },
            };
        },
    ]);
})(window.angular);
